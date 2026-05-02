/**
 * Script 01: Rename shifted utility classes
 *
 * Tailwind v4 shifted the t-shirt sizing scale:
 * - "sm" → "xs" (shadow-sm → shadow-xs, rounded-sm → rounded-xs, blur-sm → blur-xs)
 * - default (no suffix) → "sm" (shadow → shadow-sm, rounded → rounded-sm, blur → blur-sm)
 * - outline-none → outline-hidden
 *
 * Only transforms within class/className attributes to avoid false positives.
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

const RENAMES: [string, string][] = [
  ['shadow-sm', 'shadow-xs'],
  ['shadow', 'shadow-sm'],
  ['rounded-sm', 'rounded-xs'],
  ['rounded', 'rounded-sm'],
  ['blur-sm', 'blur-xs'],
  ['blur', 'blur-sm'],
  ['outline-none', 'outline-hidden'],
  ['inset-shadow-sm', 'inset-shadow-xs'],
  ['inset-shadow', 'inset-shadow-sm'],
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
      if (['shadow', 'rounded', 'blur', 'inset-shadow'].includes(oldClass)) {
        const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b(?!-)`, 'g');
        newClasses = newClasses.replace(regex, newClass);
      } else {
        const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b`, 'g');
        newClasses = newClasses.replace(regex, newClass);
      }
    }
    return match.replace(classes, newClasses);
  });

  return content;
}
