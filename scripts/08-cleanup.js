/**
 * Script 08: Final cleanup and validation
 *
 * - Remove duplicate spaces in class attributes
 * - Clean up empty class attributes
 * - Validate no broken class names
 */



export default function transform(root) {
  let content = root.root().text();

  // Remove duplicate spaces in class attributes
  content = content.replace(/class="([^"]*?)"/g, (_match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `class="${cleaned}"`;
  });

  // Also handle className (React/JSX)
  content = content.replace(/className="([^"]*?)"/g, (_match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });

  return content;
}
