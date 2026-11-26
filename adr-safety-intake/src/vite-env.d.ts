/// <reference types="vite/client" />

declare module "*.csv?raw" {
  const content: string;
  export default content;
}

declare module "@pdf-lib/fontkit" {
  const fontkit: unknown;
  export default fontkit;
}
