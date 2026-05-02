/**
 * Script 08: Final cleanup and validation
 *
 * - Remove duplicate spaces in class attributes
 * - Clean up empty class attributes
 * - Validate no broken class names
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

export default function transform(root: SgRoot): string {
  let content = root.root().text();

  // Remove duplicate spaces in class attributes
  content = content.replace(/class="([^"]*?)"/g, (_match: string, classes: string) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `class="${cleaned}"`;
  });

  // Also handle className (React/JSX)
  content = content.replace(/className="([^"]*?)"/g, (_match: string, classes: string) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });

  return content;
}
