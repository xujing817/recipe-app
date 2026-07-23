const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

let fixed = 0;
for (const recipe of db.recipes) {
  if (typeof recipe.ingredients === 'string') {
    const raw = recipe.ingredients.trim().replace(/[.\u3002]$/g, '');
    recipe.ingredients = raw
      .split(/[\uff0c,\u3001\uff1b;]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    fixed++;
  }
  if (!Array.isArray(recipe.ingredients)) {
    recipe.ingredients = [String(recipe.ingredients || '')];
    fixed++;
  }
}

let stepsFixed = 0;
for (const recipe of db.recipes) {
  if (typeof recipe.steps === 'string') {
    recipe.steps = recipe.steps.trim()
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    stepsFixed++;
  }
  if (!Array.isArray(recipe.steps)) {
    recipe.steps = [String(recipe.steps || '')];
    stepsFixed++;
  }
}

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
console.log('Fixed ingredients:', fixed);
console.log('Fixed steps:', stepsFixed);
const stillBad = db.recipes.filter(r => !Array.isArray(r.ingredients) || !Array.isArray(r.steps));
console.log('Still bad:', stillBad.length);