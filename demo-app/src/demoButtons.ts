import { VizHubRuntime } from "@vizhub/runtime";
import { d3Demo } from "./fixtures/d3Demo";
import { reactDemo } from "./fixtures/reactDemo";
import { helloWorldDemo } from "./fixtures/helloWorldDemo";
import { threeJsUsage } from "./fixtures/threeJsUsage";

export const demoButtons = (runtime: VizHubRuntime) => {
  // Get the button container from the DOM
  const buttonContainer = document.getElementById("button-container");
  
  if (!buttonContainer) {
    console.error("Button container not found");
    return;
  }

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
  buttonConfigs.forEach((config) => {
    const button = document.createElement("button");
    button.textContent = config.text;
    button.style.backgroundColor = config.backgroundColor;
    button.style.color = config.color;

    // Add event listener
    button.addEventListener("click", () => {
      console.log(`Loading ${config.text}...`);
      runtime.handleCodeChange(config.demo);
    });

    buttonContainer.appendChild(button);
  });
};
