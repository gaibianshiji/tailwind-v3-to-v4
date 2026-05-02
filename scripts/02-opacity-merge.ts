/**
 * Script 02: Merge opacity utilities with color classes
 *
 * Tailwind v4 removes standalone opacity utilities (bg-opacity-*, text-opacity-*, etc.)
 * and requires the slash notation: bg-blue-500/50 instead of bg-blue-500 bg-opacity-50
 *
 * Only transforms within class/className attributes to avoid false positives.
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

const OPACITY_PREFIXES = [
  'bg', 'text', 'border', 'ring', 'divide', 'placeholder',
  'from', 'to', 'via', 'outline', 'shadow', 'accent', 'caret', 'fill', 'stroke',
];

export default function transform(root: SgRoot): string {
  let content = root.root().text();

  // Only transform within class/className attributes
  content = content.replace(/(?:class|className)="([^"]*)"/g, (match: string, classes: string) => {
    let newClasses = classes;
    for (const prefix of OPACITY_PREFIXES) {
      const colorPattern = `${prefix}-((?:\\[[^\\]]+\\]|\\w+(?:-\\w+)*))`;
      const opacityPattern = `${prefix}-opacity-(\\d+)`;

      const forwardRegex = new RegExp(`\\b${colorPattern}\\s+${opacityPattern}\\b`, 'g');
      newClasses = newClasses.replace(forwardRegex, (_: string, color: string, opacity: string) => `${prefix}-${color}/${opacity}`);

      const reverseRegex = new RegExp(`\\b${opacityPattern}\\s+${colorPattern}\\b`, 'g');
      newClasses = newClasses.replace(reverseRegex, (_: string, opacity: string, color: string) => `${prefix}-${color}/${opacity}`);
    }
    return match.replace(classes, newClasses);
  });

  return content;
}
