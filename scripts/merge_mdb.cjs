const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const MDB_EXPORT_PATH = path.join(__dirname, '..', 'data', 'mdb_export.json');

// Read current db.json
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Read MDB export, strip BOM
let mdbRaw = fs.readFileSync(MDB_EXPORT_PATH, 'utf-8');
if (mdbRaw.charCodeAt(0) === 0xFEFF) {
  mdbRaw = mdbRaw.slice(1);
}
const mdbData = JSON.parse(mdbRaw);

console.log(`Current recipes in db.json: ${db.recipes.length}`);
console.log(`Recipes from MDB: ${mdbData.recipes.length}`);

// Collect existing recipe names (case-insensitive) to avoid duplicates
const existingNames = new Set(db.recipes.map(r => r.name.toLowerCase()));
const existingIds = new Set(db.recipes.map(r => r.id));

// Collect existing category names
const existingCategories = new Set(db.categories.map(c => c.name));

// Track new categories to add
const newCategories = [];

// Filter and add new recipes
let addedCount = 0;
let skippedCount = 0;

for (const recipe of mdbData.recipes) {
  // Skip if name already exists
  if (existingNames.has(recipe.name.toLowerCase())) {
    skippedCount++;
    continue;
  }
  
  // Skip if ID already exists
  if (existingIds.has(recipe.id)) {
    skippedCount++;
    continue;
  }
  
  // Add to recipes
  db.recipes.push(recipe);
  existingNames.add(recipe.name.toLowerCase());
  existingIds.add(recipe.id);
  addedCount++;
  
  // Check if category is new
  if (recipe.category && !existingCategories.has(recipe.category)) {
    const newCat = {
      id: 'cat-' + Date.now() + '-' + newCategories.length,
      name: recipe.category,
      created_at: new Date().toISOString(),
    };
    db.categories.push(newCat);
    existingCategories.add(recipe.category);
    newCategories.push(recipe.category);
  }
}

// Write back
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

console.log(`Added: ${addedCount} recipes`);
console.log(`Skipped (duplicates): ${skippedCount} recipes`);
console.log(`New categories added: ${newCategories.length}`);
if (newCategories.length > 0) {
  console.log(`New categories: ${newCategories.join(', ')}`);
}
console.log(`Total recipes now: ${db.recipes.length}`);
console.log(`Total categories now: ${db.categories.length}`);
console.log('Done! db.json updated.');
