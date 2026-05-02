/**
 * Script 07: Handle responsive and state prefixes
 *
 * Tailwind classes can have prefixes like hover:, md:, focus:, etc.
 * This script ensures all renames are applied correctly with prefixes.
 *
 * The previous scripts already handle prefixes via the class-attribute approach.
 * This script does a final pass to catch any edge cases where prefixes
 * might have been missed.
 */



// All class renames that need prefix-aware matching
const PREFIXED_RENAMES = [
  ['shadow-sm', 'shadow-xs'],
  ['shadow', 'shadow-sm'],
  ['rounded-sm', 'rounded-xs'],
  ['rounded', 'rounded-sm'],
  ['blur-sm', 'blur-xs'],
  ['blur', 'blur-sm'],
  ['outline-none', 'outline-hidden'],
  ['flex-grow-0', 'grow-0'],
  ['flex-grow', 'grow'],
  ['flex-shrink-0', 'shrink-0'],
  ['flex-shrink', 'shrink'],
  ['overflow-ellipsis', 'text-ellipsis'],
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function transform(root)) {
  let content = root.root().text();

  // Only transform within class/className attributes
  content = content.replace(/(?:class|className)="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    for (const [oldClass, newClass] of PREFIXED_RENAMES) {
      if (['shadow', 'rounded', 'blur'].includes(oldClass)) {
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
