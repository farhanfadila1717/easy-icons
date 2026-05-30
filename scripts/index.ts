import fsnode, { ReadStream } from "fs";
import fs from "fs/promises";
import path from "path";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";
import svg2ttf from "svg2ttf";
import { fileURLToPath } from "url";

interface IconSvg {
  name: string;
  path: string;
  codepoint: number;
}

type GlyphStream = ReadStream & {
  metadata: {
    unicode: string[];
    name: string;
  };
};

const START_CODEPOINT = 0xe900;

async function getAllSvgFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getAllSvgFiles(fullPath)));
      continue;
    }

    if (entry.name.endsWith(".svg")) {
      files.push(fullPath);
    }
  }

  return files;
}

const camelCase = (str: string) => {
    return str.replace(/[-_ ]+([a-zA-Z0-9])/g, (_, char) =>
      char.toUpperCase(),
    )
};

const pascalCase = (str: string) =>{
    return str
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join("")
}


async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const projectRoot = path.resolve(__dirname, "..");

  const svgDir = path.join(projectRoot, "svg", "ionicons");
  const buildDir = path.join(projectRoot, "build");
  const fontDir = path.join(projectRoot, "fonts");
  const dartDir = path.join(projectRoot, "lib");


  await fs.mkdir(buildDir, { recursive: true });

  const svgFontPath = path.join(buildDir, "icons.svg");
  const ttfFontPath = path.join(fontDir, "IonIcons.ttf");
  const dartPath = path.join(dartDir, "ionicons.dart");

  const svgFiles = await getAllSvgFiles(svgDir);

  svgFiles.sort((a, b) =>
    path.basename(a).localeCompare(path.basename(b)),
  );

  const icons: IconSvg[] = svgFiles.map((file, index) => ({
    name: path.parse(file).name,
    path: file,
    codepoint: START_CODEPOINT + index,
  }));

  console.log(`Found ${icons.length} icons`);

  const fontStream = new SVGIcons2SVGFontStream({
    fontName: "AppIcons",
    normalize: true,
    fontHeight: 1000,
  });

  const svgFont = fsnode.createWriteStream(svgFontPath);

  fontStream.pipe(svgFont);
  let dartFileTemplate: string  = ""

  for (const icon of icons) {
    const glyph = fsnode.createReadStream(
      icon.path,
    ) as GlyphStream;

    glyph.metadata = {
      unicode: [String.fromCharCode(icon.codepoint)],
      name: icon.name,
    };

    fontStream.write(glyph);

    dartFileTemplate += `
    // ${icon.name}
    static const ${camelCase(icon.name)} = IonIcons._(IconData(${icon.codepoint}, fontFamily: 'IonIcons'));\n
    `
  }

  fontStream.end();

  await new Promise<void>((resolve, reject) => {
    svgFont.on("finish", resolve);
    svgFont.on("error", reject);
    fontStream.on("error", reject);
  });

  console.log("SVG Font Generated");

  const svgFontContent = await fs.readFile(
    svgFontPath,
    "utf8",
  );

  const ttf = svg2ttf(svgFontContent);

  await fs.writeFile(
    ttfFontPath,
    Buffer.from(ttf.buffer),
  );

  await fs.writeFile(
    dartPath,
    `
    import 'package:flutter/material.dart';

    final class IonIcons {
      final IconData iconData;

      const IonIcons._(this.iconData);

      ${dartFileTemplate}
    }
    `,
  );

  console.log("TTF Generated");
  console.log(ttfFontPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});