import { VizHubRuntime } from "@vizhub/runtime";
import { d3DemoV2 } from "./fixtures/d3DemoV2";
import { d3DemoV3 } from "./fixtures/d3DemoV3";
import { reactDemoV2 } from "./fixtures/reactDemoV2";
import { helloWorldDemoV1 } from "./fixtures/helloWorldDemoV1";
import { threeJsDemoV4 } from "./fixtures/threeJsDemoV4";

export const demoButtons = (runtime: VizHubRuntime) => {
  // Get the button container from the DOM
  const buttonContainer = document.getElementById(
    "button-container",
  );

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
      demo: helloWorldDemoV1,
    },
    {
      text: "D3 Demo (v2)",
      backgroundColor: "#4285f4",
      color: "white",
      demo: d3DemoV2,
    },
    {
      text: "React Demo (v2)",
      backgroundColor: "#61dafb",
      color: "black",
      demo: reactDemoV2,
    },
    {
      text: "D3 Demo (v3)",
      backgroundColor: "rgb(30 255 0)",
      color: "black",
      demo: d3DemoV3,
    },
    {
      text: "Three.js Demo (v4)",
      backgroundColor: "#ffcc00",
      color: "black",
      demo: threeJsDemoV4,
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
