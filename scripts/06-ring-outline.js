/**
 * Script 06: Update ring and outline utilities
 *
 * Tailwind v4 changes:
 * - outline-2 → outline-md, outline-4 → outline-lg
 *
 * Only transforms within class/className attributes to avoid false positives.
 */



const RENAMES = [
  ['outline-2', 'outline-md'],
  ['outline-4', 'outline-lg'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function transform(root) {
  let content = root.root().text();

  // Only transform within class/className attributes
  content = content.replace(/(?:class|className)="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    for (const [oldClass, newClass] of RENAMES) {
      const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b`, 'g');
      newClasses = newClasses.replace(regex, newClass);
    }
    return match.replace(classes, newClasses);
  });

  return content;
}
