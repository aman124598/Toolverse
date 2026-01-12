/**
 * Mass Tool Migration Script
 * Generates all 121 tool pages from the categories
 */

import { toolCategories, getToolTitle } from '../src/lib/tool-categories';
import { generateToolFiles } from '../src/lib/tool-generator';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const appDir = path.join(__dirname, '..', 'src', 'app');

let totalGenerated = 0;
let skipped = 0;

console.log('🚀 Starting mass tool migration...\n');

// Already migrated tools - skip these
const alreadyMigrated = ['data-generator'];

for (const [category, tools] of Object.entries(toolCategories)) {
  console.log(`\n📁 ${category}:`);
  
  for (const toolSlug of tools) {
    if (alreadyMigrated.includes(toolSlug)) {
      console.log(`  ⏭️  Skipped ${toolSlug} (already exists)`);
      skipped++;
      continue;
    }

    const toolTitle = getToolTitle(toolSlug);
    
    try {
      generateToolFiles(toolSlug, toolTitle, category, appDir);
      totalGenerated++;
    } catch (error) {
      console.error(`  ❌ Error generating ${toolSlug}:`, (error as Error).message);
    }
  }
}

console.log(`\n✅ Migration complete!`);
console.log(`   Generated: ${totalGenerated} tools`);
console.log(`   Skipped: ${skipped} tools`);
console.log(`   Total: ${totalGenerated + skipped} tools`);
console.log(`\n📝 All tools now available at:`);
console.log(`   http://localhost:3000/[tool-slug]`);
