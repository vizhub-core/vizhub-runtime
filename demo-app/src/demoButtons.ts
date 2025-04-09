import { VizHubRuntime } from "@vizhub/runtime";
import { d3Demo } from "./fixtures/d3Demo";
import { reactDemo } from "./fixtures/reactDemo";
import { helloWorldDemo } from "./fixtures/helloWorldDemo";
import { threeJsUsage } from "./fixtures/threeJsUsage";

export const demoButtons = (runtime: VizHubRuntime) => {
  // Create container for buttons
  // TODO define this in index.html
  const buttonContainer = document.createElement("div");
  buttonContainer.style.position = "fixed";
  buttonContainer.style.top = "10px";
  buttonContainer.style.left = "10px";
  buttonContainer.style.zIndex = "1000";
  document.body.appendChild(buttonContainer);

  // Define button configurations
  const buttonConfigs = [
    {
      text: "Hello World (v1)",
      backgroundColor: "#34a853",
      color: "white",
      demo: helloWorldDemo,
    },
    {
      text: "D3 Demo (v2)",
      backgroundColor: "#4285f4",
      color: "white",
      demo: d3Demo,
    },
    {
      text: "React Demo (v2)",
      backgroundColor: "#61dafb",
      color: "black",
      demo: reactDemo,
    },
    {
      text: "Three.js Demo (v4)",
      backgroundColor: "#ffcc00",
      color: "black",
      demo: threeJsUsage,
    },
  ];

  // Create buttons from configurations
  buttonConfigs.forEach((config, index) => {
    const button = document.createElement("button");
    button.textContent = config.text;
    button.style.padding = "8px 16px";
    button.style.backgroundColor = config.backgroundColor;
    button.style.color = config.color;
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";

    // Add margin to all but the last button
    if (index < buttonConfigs.length - 1) {
      button.style.marginRight = "10px";
    }

    // Add event listener
    button.addEventListener("click", () => {
      console.log(`Loading ${config.text}...`);
      runtime.handleCodeChange(config.demo);
    });

    buttonContainer.appendChild(button);
  });
};
