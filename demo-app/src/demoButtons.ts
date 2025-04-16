import { VizHubRuntime } from "@vizhub/runtime";
import { VizContent } from "@vizhub/viz-types";
import { vizFilesToFileCollection } from "@vizhub/viz-utils";

export const demoButtons = (
  runtime: VizHubRuntime,
  vizContentsArray: Array<{
    label: string;
    status: string;
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
  vizContentsArray.forEach(
    ({ label, vizContent, status }) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.className = "status-" + status;

      // Add event listener
      button.addEventListener("click", () => {
        console.log(`Loading ${label}...`);
        runtime.run({
          files: vizFilesToFileCollection(vizContent.files),
          enableHotReloading: true,
        });
      });

      buttonContainer.appendChild(button);
    },
  );
};
