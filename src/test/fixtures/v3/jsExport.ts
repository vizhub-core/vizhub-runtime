export const jsExport = {
  "index.js": `
    import { innerMessage } from './message';
    export const message = "Outer " + innerMessage;
    console.log(message);
  `,
  "message.js": `
    export const innerMessage = "Inner";
  `,
};
