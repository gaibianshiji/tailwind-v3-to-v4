/**
 * Script 03: Update CSS directives
 *
 * Tailwind v4 replaces:
 * - @tailwind base; @tailwind components; @tailwind utilities; → @import "tailwindcss";
 * - Individual @tailwind directives are no longer needed
 * - @layer base/components/utilities still work but @theme is new
 */

import type { SgRoot, SgNode } from 'codemod:ast-grep';

export default function transform(root: SgRoot): string {
  let content = root.root().text();

  // Combined @tailwind directives → @import "tailwindcss"
  content = content.replace(
    /@tailwind\s+base;\s*\n?\s*@tailwind\s+components;\s*\n?\s*@tailwind\s+utilities;/g,
    '@import "tailwindcss";'
  );

  // Individual @tailwind directives → comment + import
  content = content.replace(
    /@tailwind\s+base;/g,
    '/* Migrated from @tailwind base */'
  );
  content = content.replace(
    /@tailwind\s+components;/g,
    '/* Migrated from @tailwind components */'
  );
  content = content.replace(
    /@tailwind\s+utilities;/g,
    '@import "tailwindcss";'
  );

  // If only @tailwind base and components remain (without utilities), add import
  if (content.includes('Migrated from @tailwind') && !content.includes('@import "tailwindcss"')) {
    content = '@import "tailwindcss";\n\n' + content;
  }

  return content;
}
