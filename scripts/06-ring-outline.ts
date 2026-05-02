/**
 * Script 06: Update ring and outline utilities
 *
 * Tailwind v4 changes:
 * - outline-2 → outline-md, outline-4 → outline-lg
 *
 * Only transforms within class/className attributes to avoid false positives.
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

const RENAMES: [string, string][] = [
  ['outline-2', 'outline-md'],
  ['outline-4', 'outline-lg'],
];

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function transform(root: SgRoot): string {
  let content = root.root().text();

  // Only transform within class/className attributes
  content = content.replace(/(?:class|className)="([^"]*)"/g, (match: string, classes: string) => {
    let newClasses = classes;
    for (const [oldClass, newClass] of RENAMES) {
      const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b`, 'g');
      newClasses = newClasses.replace(regex, newClass);
    }
    return match.replace(classes, newClasses);
  });

  return content;
}
