import { IconSvg, IconSvgFormat } from "../models/IconSvg";

export async function buildDartFile(
  svgFormat: IconSvgFormat,
  iconList: IconSvg[],
  dartDir: string,
): Promise<string> {
  let template = `
import 'package:flutter/material.dart';

final class ${svgFormat.name} {
  final IconData iconData;

  const ${svgFormat.name}._(this.iconData);
    `;

  for (var icon of iconList) {
    template += `
// ${icon.iconName} icon
static const ${icon.iconDartName} = ${svgFormat.name}._(IconData(${icon.codeunit}, fontFamily: '${svgFormat.name}',  fontPackage: 'easy_icons'));
    `;
  }

  template += "}";

  return template;
}
