import { IconSvg, IconSvgFormat } from "../models/IconSvg";

export async function buildDocFile(
  svgFormat: IconSvgFormat,
  iconList: IconSvg[],
): Promise<string> {
  let template = `
import type Icons from "./icons";

export const ${svgFormat.name}List: Icons[] = [
    `;

  for (var icon of iconList) {
    template += `
{
 iconName: "${icon.iconName}",
 unicode: ${icon.codeunit},
 fontName: "${svgFormat.name}",
},
`;
  }

  template += `
];  
`;

  return template;
}
