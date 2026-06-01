import path from "node:path";
import fs from "node:fs/promises";
import {
  cleanupSVG,
  isEmptyColor,
  parseColors,
  runSVGO,
  SVG,
} from "@iconify/tools";
import { type IconSvg } from "../models/IconSvg";

const dartReservedWords = new Set([
  "abstract",
  "as",
  "assert",
  "async",
  "await",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "covariant",
  "default",
  "deferred",
  "do",
  "dynamic",
  "else",
  "enum",
  "export",
  "extends",
  "extension",
  "external",
  "factory",
  "false",
  "final",
  "finally",
  "for",
  "Function",
  "get",
  "hide",
  "if",
  "implements",
  "import",
  "in",
  "interface",
  "is",
  "late",
  "library",
  "mixin",
  "new",
  "null",
  "on",
  "operator",
  "part",
  "required",
  "rethrow",
  "return",
  "set",
  "show",
  "static",
  "super",
  "switch",
  "sync",
  "this",
  "throw",
  "true",
  "try",
  "typedef",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

function camelCase(str: string): string {
  return str
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part, index) =>
      index === 0
        ? part.charAt(0).toLowerCase() + part.slice(1)
        : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join("");
}

function safeDartName(name: string): string {
  const camel = camelCase(name);

  if (dartReservedWords.has(camel)) {
    return `${camel}Icon`;
  }

  if (/^\d/.test(camel)) {
    return `icon${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
  }

  return camel;
}

export async function optimizeSvg(iconPath: string): Promise<IconSvg> {
  try {
    const iconName = path.parse(iconPath).name;
    const svgFile = await fs.readFile(iconPath, "utf8");
    const svg = new SVG(svgFile);

    cleanupSVG(svg);
    parseColors(svg, {
      callback: (_, colorStr, color) =>
        !color || !isEmptyColor(color) ? colorStr : "currentColor",
    });
    runSVGO(svg);

    return {
      iconName: iconName,
      iconDartName: safeDartName(iconName),
      iconPath: iconPath,
      iconData: svg.toString(),
      codeunit: 0,
    };
  } catch (ex) {
    console.error(ex);
    throw "";
  }
}
