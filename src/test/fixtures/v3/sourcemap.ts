export const sourcemap = {
  "index.js": `
    const x = 1;
    const y = 2;
    console.log(x + y);
    
    // The error should resolve to this line number, 6.
    throw new Error("Hello main!");
  `,
};
