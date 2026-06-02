import fs from "node:fs/promises";
import fsnode, { ReadStream } from "node:fs";
import path from "node:path";
import svg2ttf from "svg2ttf";
import { SVGIcons2SVGFontStream } from "svgicons2svgfont";

import { IconSvg, IconSvgFormat } from "./models/IconSvg";
import { optimizeSvg } from "./utils/utils";
import { buildDartFile } from "./templates/dart_template";
import { buildDocFile } from "./templates/doc_template";

type GlyphStream = ReadStream & {
  metadata: {
    unicode: string[];
    name: string;
  };
};

const BASE_DIR = "..";

const iconSvgFormatList: IconSvgFormat[] = [
  {
    name: "IonIcons",
    pathDirectory: "svg/ionicons",
  },
  {
    name: "TablerIcons",
    pathDirectory: "svg/tablericons/filled",
  },
  {
    name: "RemixIcons",
    pathDirectory: "svg/remixicons",
  },
];

async function getAllSvgFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, {
    withFileTypes: true,
  });

  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await getAllSvgFiles(fullPath)));
    } else if (entry.name.endsWith(".svg")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  for (const iconFormat of iconSvgFormatList) {
    console.log(`\n=== ${iconFormat.name} ===`);

    const iconDir = path.resolve(BASE_DIR, iconFormat.pathDirectory);

    const svgFiles = await getAllSvgFiles(iconDir);

    console.log(`Found ${svgFiles.length} SVG files`);

    const icons: IconSvg[] = [];

    let codepoint = 0xe900;

    // ---------- PATHS ----------

    const buildDir = path.resolve(BASE_DIR, "build");
    const fontOutputDir = path.resolve(BASE_DIR, "fonts");

    await fs.mkdir(buildDir, {
      recursive: true,
    });

    await fs.mkdir(fontOutputDir, {
      recursive: true,
    });

    const svgFontPath = path.join(buildDir, `${iconFormat.name}.svg`);

    const ttfFontPath = path.join(fontOutputDir, `${iconFormat.name}.ttf`);

    // ---------- SVG FONT ----------

    const fontStream = new SVGIcons2SVGFontStream({
      fontName: iconFormat.name,
      normalize: true,
      fontHeight: 1000,
    });

    const svgFontWriteStream = fsnode.createWriteStream(svgFontPath);

    fontStream.pipe(svgFontWriteStream);

    // ---------- PROCESS ICONS ----------

    for (const svgFile of svgFiles) {
      const response = await optimizeSvg(svgFile);

      // overwrite source svg with optimized svg
      await fs.writeFile(response.iconPath, response.iconData, "utf8");

      const currentCodepoint = codepoint++;

      icons.push({
        ...response,
        codeunit: currentCodepoint,
      });

      const glyph = fsnode.createReadStream(response.iconPath) as GlyphStream;

      glyph.metadata = {
        unicode: [String.fromCodePoint(currentCodepoint)],
        name: response.iconName,
      };

      fontStream.write(glyph);
    }

    // ---------- FINALIZE SVG FONT ----------

    fontStream.end();

    await new Promise<void>((resolve, reject) => {
      svgFontWriteStream.on("finish", resolve);

      svgFontWriteStream.on("error", reject);

      fontStream.on("error", reject);
    });

    console.log(`Generated SVG Font: ${svgFontPath}`);

    // ---------- SVG FONT -> TTF ----------

    const svgFontContent = await fs.readFile(svgFontPath, "utf8");

    const ttf = svg2ttf(svgFontContent);

    await fs.writeFile(ttfFontPath, Buffer.from(ttf.buffer));

    console.log(`Generated TTF Font: ${ttfFontPath}`);

    // ---------- DART ----------

    const dartPath = path.resolve(
      BASE_DIR,
      `lib/generated/${iconFormat.name.toLowerCase()}.dart`,
    );

    await fs.mkdir(path.dirname(dartPath), {
      recursive: true,
    });

    const dartTemplate = await buildDartFile(iconFormat, icons, dartPath);

    await fs.writeFile(dartPath, dartTemplate, "utf8");

    console.log(`Generated Dart: ${dartPath}`);

    // ---------- DOC ----------
    const docPath = path.resolve(
      BASE_DIR,
      `doc/src/core/models/${iconFormat.name.toLowerCase()}.ts`,
    );
    const docFontPath = path.resolve(
      BASE_DIR,
      `doc/public/fonts/${iconFormat.name}.ttf`,
    );
    await fs.writeFile(docFontPath, Buffer.from(ttf.buffer));
    console.log(`Generated Font for Doc : ${docFontPath}`);
    const docTemplate = await buildDocFile(iconFormat, icons);
    await fs.writeFile(docPath, docTemplate, "utf8");

    console.log(`Generated Doc: ${docPath}`);

    console.log(`Finished ${iconFormat.name} (${icons.length} icons)`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
