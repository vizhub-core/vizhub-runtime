/**
 * Formats an error object into a readable error message for runtime errors
 */
export const formatRuntimeError = (
  error: Error | ErrorEvent | PromiseRejectionEvent,
): string => {
  if (error instanceof Error) {
    // Regular Error object
    const stack = error.stack || "";
    const message = error.message || "Unknown error";
    return `${error.name || "Error"}: ${message}\n${stack}`;
  } else if (
    "error" in error &&
    error.error instanceof Error
  ) {
    // ErrorEvent from window.addEventListener('error')
    const err = error.error;
    const stack = err.stack || "";
    const message = err.message || "Unknown error";
    const filename =
      "filename" in error ? error.filename : "";
    const lineno = "lineno" in error ? error.lineno : "";
    const colno = "colno" in error ? error.colno : "";

    let location = "";
    if (filename && lineno) {
      location = ` at ${filename}:${lineno}`;
      if (colno) location += `:${colno}`;
    }

    return `${err.name || "Error"}: ${message}${location}\n${stack}`;
  } else if ("reason" in error) {
    // PromiseRejectionEvent from window.addEventListener('unhandledrejection')
    const reason = error.reason;
    if (reason instanceof Error) {
      const stack = reason.stack || "";
      const message = reason.message || "Unknown error";
      return `Unhandled Promise Rejection - ${reason.name || "Error"}: ${message}\n${stack}`;
    } else {
      return `Unhandled Promise Rejection: ${String(reason)}`;
    }
  } else {
    // Fallback for unknown error types
    return `Unknown runtime error: ${String(error)}`;
  }
};

/**
 * Returns JavaScript code that sets up global error handlers for runtime error detection
 */
export const getRuntimeErrorHandlerScript = (): string => {
  return `
    // Global error handling for runtime errors
    (() => {
      const formatRuntimeError = ${formatRuntimeError.toString()};
      
      // Handle uncaught JavaScript errors
      window.addEventListener('error', (event) => {
        const formattedErrorMessage = formatRuntimeError(event);
        parent.postMessage({ 
          type: 'runtimeError', 
          formattedErrorMessage 
        }, "*");
      });
      
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        const formattedErrorMessage = formatRuntimeError(event);
        parent.postMessage({ 
          type: 'runtimeError', 
          formattedErrorMessage 
        }, "*");
      });
    })();
  `;
};
