declare module "svg2ttf" {
  interface Svg2TtfResult {
    buffer: ArrayBuffer;
  }

  export default function svg2ttf(
    svg: string,
    options?: unknown,
  ): Svg2TtfResult;
}