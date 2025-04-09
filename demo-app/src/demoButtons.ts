import { VizHubRuntime } from "@vizhub/runtime";
import { VizContent } from "@vizhub/viz-types";

export const demoButtons = (
  runtime: VizHubRuntime,
  vizContentsArray: Array<{
    label: string;
    vizContent: VizContent;
  }>,
) => {
  // Get the button container from the DOM
  const buttonContainer = document.getElementById(
    "button-container",
  );

  if (!buttonContainer) {
    console.error("Button container not found");
    return;
  }

  // Create buttons from configurations
  vizContentsArray.forEach(({ label, vizContent }) => {
    const button = document.createElement("button");
    button.textContent = label;

    // Add event listener
    button.addEventListener("click", () => {
      console.log(`Loading ${label}...`);
      runtime.setVizId(vizContent.id);
    });

    buttonContainer.appendChild(button);
  });
};
