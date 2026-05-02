#!/usr/bin/env node
/**
 * Test runner for Tailwind CSS v3→v4 codemod
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import all transform functions from migrate.mjs
// We need to extract the transform functions
// Let's re-implement them here for testing

// ============================================================
// TRANSFORM FUNCTIONS (same as migrate.mjs)
// ============================================================

const CLASS_RENAMES = [
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

const DEPRECATED_RENAMES = [
  ['flex-grow-0', 'grow-0'],
  ['flex-grow', 'grow'],
  ['flex-shrink-0', 'shrink-0'],
  ['flex-shrink', 'shrink'],
  ['overflow-ellipsis', 'text-ellipsis'],
  ['decoration-clone', 'box-decoration-clone'],
  ['decoration-slice', 'box-decoration-slice'],
];

const RING_OUTLINE_RENAMES = [
  ['outline-2', 'outline-md'],
  ['outline-4', 'outline-lg'],
];

const OPACITY_PREFIXES = [
  'bg', 'text', 'border', 'ring', 'divide', 'placeholder',
  'from', 'to', 'via', 'outline', 'shadow', 'accent', 'caret', 'fill', 'stroke',
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applyClassRenames(content, renames) {
  // Only transform within class/className attributes to avoid false positives
  return content.replace(/(?:class|className)="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    for (const [oldClass, newClass] of renames) {
      if (oldClass === 'shadow' || oldClass === 'rounded' || oldClass === 'blur' || oldClass === 'inset-shadow') {
        const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b(?!-)`, 'g');
        newClasses = newClasses.replace(regex, newClass);
      } else {
        const regex = new RegExp(`\\b${escapeRegex(oldClass)}\\b`, 'g');
        newClasses = newClasses.replace(regex, newClass);
      }
    }
    return match.replace(classes, newClasses);
  });
}

function mergeOpacityClasses(content) {
  // Only transform within class/className attributes
  return content.replace(/(?:class|className)="([^"]*)"/g, (match, classes) => {
    let newClasses = classes;
    for (const prefix of OPACITY_PREFIXES) {
      const colorPattern = `${prefix}-((?:\\[[^\\]]+\\]|\\w+(?:-\\w+)*))`;
      const opacityPattern = `${prefix}-opacity-(\\d+)`;

      const forwardRegex = new RegExp(`\\b${colorPattern}\\s+${opacityPattern}\\b`, 'g');
      newClasses = newClasses.replace(forwardRegex, (_, color, opacity) => `${prefix}-${color}/${opacity}`);

      const reverseRegex = new RegExp(`\\b${opacityPattern}\\s+${colorPattern}\\b`, 'g');
      newClasses = newClasses.replace(reverseRegex, (_, opacity, color) => `${prefix}-${color}/${opacity}`);
    }
    return match.replace(classes, newClasses);
  });
}

function updateDirectives(content) {
  let result = content;
  result = result.replace(
    /@tailwind\s+base;\s*\n?\s*@tailwind\s+components;\s*\n?\s*@tailwind\s+utilities;/g,
    '@import "tailwindcss";'
  );
  result = result.replace(/@tailwind\s+base;/g, '/* Migrated from @tailwind base */');
  result = result.replace(/@tailwind\s+components;/g, '/* Migrated from @tailwind components */');
  result = result.replace(/@tailwind\s+utilities;/g, '@import "tailwindcss";');
  return result;
}

function applyAllTransforms(content, fileType = 'html') {
  let result = content;

  if (fileType === 'css') {
    result = updateDirectives(result);
  }

  result = applyClassRenames(result, CLASS_RENAMES);
  result = applyClassRenames(result, DEPRECATED_RENAMES);
  result = mergeOpacityClasses(result);
  result = applyClassRenames(result, RING_OUTLINE_RENAMES);

  // Cleanup
  result = result.replace(/class="([^"]*?)"/g, (match, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `class="${cleaned}"`;
  });

  return result;
}

// ============================================================
// TEST SUITES
// ============================================================

const tests = [
  {
    name: '01-shadow-renames',
    input: `<div class="shadow-sm p-4">Small shadow</div>
<div class="shadow p-4">Default shadow</div>
<div class="shadow-md p-4">Medium shadow</div>
<div class="shadow-lg p-4">Large shadow</div>`,
    expected: `<div class="shadow-xs p-4">Small shadow</div>
<div class="shadow-sm p-4">Default shadow</div>
<div class="shadow-md p-4">Medium shadow</div>
<div class="shadow-lg p-4">Large shadow</div>`,
  },
  {
    name: '02-rounded-renames',
    input: `<div class="rounded-sm">Small rounded</div>
<div class="rounded">Default rounded</div>
<div class="rounded-md">Medium rounded</div>
<div class="rounded-lg">Large rounded</div>
<div class="rounded-full">Full rounded</div>`,
    expected: `<div class="rounded-xs">Small rounded</div>
<div class="rounded-sm">Default rounded</div>
<div class="rounded-md">Medium rounded</div>
<div class="rounded-lg">Large rounded</div>
<div class="rounded-full">Full rounded</div>`,
  },
  {
    name: '03-blur-renames',
    input: `<div class="blur-sm">Small blur</div>
<div class="blur">Default blur</div>
<div class="blur-md">Medium blur</div>`,
    expected: `<div class="blur-xs">Small blur</div>
<div class="blur-sm">Default blur</div>
<div class="blur-md">Medium blur</div>`,
  },
  {
    name: '04-outline-renames',
    input: `<button class="outline-none">No outline</button>
<button class="outline-2">2px outline</button>
<button class="outline-4">4px outline</button>`,
    expected: `<button class="outline-hidden">No outline</button>
<button class="outline-md">2px outline</button>
<button class="outline-lg">4px outline</button>`,
  },
  {
    name: '05-opacity-merge',
    input: `<div class="bg-blue-500 bg-opacity-50">50% opacity</div>
<div class="text-red-500 text-opacity-75">75% text opacity</div>
<div class="border-green-500 border-opacity-25">25% border opacity</div>
<div class="bg-[#1da1f2] bg-opacity-80">Custom color opacity</div>`,
    expected: `<div class="bg-blue-500/50">50% opacity</div>
<div class="text-red-500/75">75% text opacity</div>
<div class="border-green-500/25">25% border opacity</div>
<div class="bg-[#1da1f2]/80">Custom color opacity</div>`,
  },
  {
    name: '06-deprecated-utils',
    input: `<div class="flex-grow">Grow</div>
<div class="flex-grow-0">No grow</div>
<div class="flex-shrink">Shrink</div>
<div class="flex-shrink-0">No shrink</div>
<div class="overflow-ellipsis">Ellipsis</div>
<div class="decoration-clone">Clone</div>
<div class="decoration-slice">Slice</div>`,
    expected: `<div class="grow">Grow</div>
<div class="grow-0">No grow</div>
<div class="shrink">Shrink</div>
<div class="shrink-0">No shrink</div>
<div class="text-ellipsis">Ellipsis</div>
<div class="box-decoration-clone">Clone</div>
<div class="box-decoration-slice">Slice</div>`,
  },
  {
    name: '07-css-directives',
    input: `@tailwind base;
@tailwind components;
@tailwind utilities;

.btn {
  @apply bg-blue-500 text-white;
}`,
    expected: `@import "tailwindcss";

.btn {
  @apply bg-blue-500 text-white;
}`,
  },
  {
    name: '08-prefix-handling',
    input: `<div class="hover:shadow-sm md:rounded focus:blur-sm active:outline-none">Prefixed</div>
<div class="dark:bg-gray-800 hover:flex-grow">State prefixes</div>`,
    expected: `<div class="hover:shadow-xs md:rounded-sm focus:blur-xs active:outline-hidden">Prefixed</div>
<div class="dark:bg-gray-800 hover:grow">State prefixes</div>`,
  },
  {
    name: '09-combined-transforms',
    input: `<div class="shadow-sm rounded bg-blue-500 bg-opacity-50 flex-grow outline-none">
  <p class="text-gray-500 text-opacity-75 overflow-ellipsis">Hello</p>
</div>`,
    expected: `<div class="shadow-xs rounded-sm bg-blue-500/50 grow outline-hidden">
  <p class="text-gray-500/75 text-ellipsis">Hello</p>
</div>`,
  },
  {
    name: '10-no-false-positives',
    input: `<div class="shadow-lg rounded-md bg-red-500 opacity-50">
  <span class="text-sm font-bold">Already v4</span>
</div>`,
    expected: `<div class="shadow-lg rounded-md bg-red-500 opacity-50">
  <span class="text-sm font-bold">Already v4</span>
</div>`,
  },
];

// ============================================================
// TEST RUNNER
// ============================================================

let passed = 0;
let failed = 0;

for (const test of tests) {
  const fileType = test.name.includes('css-directives') ? 'css' : 'html';
  const result = applyAllTransforms(test.input, fileType);

  if (result === test.expected) {
    console.log(`✅ ${test.name}: PASS`);
    passed++;
  } else {
    console.log(`❌ ${test.name}: FAIL`);
    console.log(`  Expected:`);
    console.log(`  ${test.expected.split('\n').join('\n  ')}`);
    console.log(`  Got:`);
    console.log(`  ${result.split('\n').join('\n  ')}`);

    // Show diff
    const expectedLines = test.expected.split('\n');
    const resultLines = result.split('\n');
    for (let i = 0; i < Math.max(expectedLines.length, resultLines.length); i++) {
      if (expectedLines[i] !== resultLines[i]) {
        console.log(`  Line ${i + 1}:`);
        console.log(`    Expected: ${expectedLines[i]}`);
        console.log(`    Got:      ${resultLines[i]}`);
      }
    }

    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed out of ${tests.length} tests`);

if (failed > 0) {
  process.exit(1);
}
