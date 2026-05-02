/**
 * Script 05: Replace deprecated utilities
 *
 * Tailwind v4 renames/removes several utilities:
 * - flex-grow → grow, flex-grow-0 → grow-0
 * - flex-shrink → shrink, flex-shrink-0 → shrink-0
 * - overflow-ellipsis → text-ellipsis
 * - decoration-clone → box-decoration-clone
 * - decoration-slice → box-decoration-slice
 *
 * Only transforms within class/className attributes to avoid false positives.
 */



const DEPRECATED_RENAMES = [
  ['flex-grow-0', 'grow-0'],
  ['flex-grow', 'grow'],
  ['flex-shrink-0', 'shrink-0'],
  ['flex-shrink', 'shrink'],
  ['overflow-ellipsis', 'text-ellipsis'],
  ['decoration-clone', 'box-decoration-clone'],
  ['decoration-slice', 'box-decoration-slice'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function transform(root)) {
  let content = root.root().text();

  // Only transform within class/className attributes
  content = content.replace(/(?:class|className)="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    for (const [oldClass, newClass] of DEPRECATED_RENAMES) {
      const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b`, 'g');
      newClasses = newClasses.replace(regex, newClass);
    }
    return match.replace(classes, newClasses);
  });

  return content;
}
