import { VizHubRuntime } from "@vizhub/runtime";
import { d3Demo } from "./fixtures/d3Demo";
import { reactDemo } from "./fixtures/reactDemo";
import { helloWorldDemo } from "./fixtures/helloWorldDemo";

export const demoButtons = (runtime: VizHubRuntime) => {
  // Create container for buttons
  const buttonContainer = document.createElement("div");
  buttonContainer.style.position = "fixed";
  buttonContainer.style.top = "10px";
  buttonContainer.style.left = "10px";
  buttonContainer.style.zIndex = "1000";
  document.body.appendChild(buttonContainer);

  // Create D3 Demo button
  const d3Button = document.createElement("button");
  d3Button.textContent = "D3 Demo";
  d3Button.style.marginRight = "10px";
  d3Button.style.padding = "8px 16px";
  d3Button.style.backgroundColor = "#4285f4";
  d3Button.style.color = "white";
  d3Button.style.border = "none";
  d3Button.style.borderRadius = "4px";
  d3Button.style.cursor = "pointer";
  buttonContainer.appendChild(d3Button);

  // Create React Demo button
  const reactButton = document.createElement("button");
  reactButton.textContent = "React Demo";
  reactButton.style.padding = "8px 16px";
  reactButton.style.backgroundColor = "#61dafb";
  reactButton.style.color = "black";
  reactButton.style.border = "none";
  reactButton.style.borderRadius = "4px";
  reactButton.style.cursor = "pointer";
  reactButton.style.marginRight = "10px";
  buttonContainer.appendChild(reactButton);

  // Create Hello World Demo button
  const helloWorldButton = document.createElement("button");
  helloWorldButton.textContent = "Hello World";
  helloWorldButton.style.padding = "8px 16px";
  helloWorldButton.style.backgroundColor = "#34a853";
  helloWorldButton.style.color = "white";
  helloWorldButton.style.border = "none";
  helloWorldButton.style.borderRadius = "4px";
  helloWorldButton.style.cursor = "pointer";
  buttonContainer.appendChild(helloWorldButton);

  // Add event listeners
  d3Button.addEventListener("click", () => {
    console.log("Loading D3 demo...");
    runtime.handleCodeChange(d3Demo);
  });

  reactButton.addEventListener("click", () => {
    console.log("Loading React demo...");
    runtime.handleCodeChange(reactDemo);
  });

  helloWorldButton.addEventListener("click", () => {
    console.log("Loading Hello World demo...");
    runtime.handleCodeChange(helloWorldDemo);
  });
};
