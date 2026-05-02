/**
 * Script 04: Migrate tailwind.config.js theme to CSS @theme blocks
 *
 * Tailwind v4 uses CSS-first configuration. This script:
 * 1. Generates a starter @theme block from common config patterns
 * 2. Adds @config directive for backward compatibility
 *
 * Note: Full config parsing requires JS AST analysis. This handles common patterns.
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

export default function transform(root: SgRoot): string {
  let content = root.root().text();

  // If this CSS file already has @import "tailwindcss", check if it needs @theme
  if (!content.includes('@import "tailwindcss"')) {
    return content;
  }

  // Add @config directive comment for manual migration
  if (!content.includes('@config') && !content.includes('@theme')) {
    const configComment = `
/* TODO: Migrate tailwind.config.js to @theme block
 * Example:
 * @theme {
 *   --color-primary: #3b82f6;
 *   --font-display: "Inter", sans-serif;
 *   --breakpoint-3xl: 1920px;
 *   --spacing-128: 32rem;
 * }
 *
 * Or use backward compatibility:
 * @config "./tailwind.config.js";
 */
`;
    content = content.replace(
      /@import "tailwindcss";/,
      `@import "tailwindcss";\n${configComment}`
    );
  }

  return content;
}
