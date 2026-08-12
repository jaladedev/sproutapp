// Ambient module declarations for asset imports that Next's build pipeline
// (webpack/SWC) resolves at build time but that bare `tsc --noEmit` doesn't
// know how to type on its own — e.g. `import "./globals.css"` in layout.tsx.
// Keep this separate from next-env.d.ts, which is auto-generated and
// shouldn't be hand-edited.

declare module "*.css";
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}
declare module "*.svg" {
  import type { FC, SVGProps } from "react";
  const content: FC<SVGProps<SVGSVGElement>>;
  export default content;
}
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.webp";
