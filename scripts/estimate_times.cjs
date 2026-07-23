const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Keywords that suggest longer cook times
const slowCook = ['炖', '焖', '卤', '煲', '煨', '煮', '蒸', '熬', '烤'];
const mediumCook = ['烧', '炒', '煎', '炸', '熘', '焖'];
const quickCook = ['拌', '焯', '汆', '烫', '凉拌'];

function estimateTimes(recipe) {
  const steps = recipe.steps || [];
  const ings = recipe.ingredients || [];
  let prep_time = 5 + ings.length * 2; // base 5min + 2min per ingredient
  let cook_time = 5;

  steps.forEach(step => {
    cook_time += 2; // 2min per step baseline
    slowCook.forEach(kw => { if (step.includes(kw)) cook_time += 5; });
    mediumCook.forEach(kw => { if (step.includes(kw)) cook_time += 3; });
    quickCook.forEach(kw => { if (step.includes(kw)) cook_time -= 1; });
  });

  // Clamp values
  prep_time = Math.max(5, Math.min(60, Math.round(prep_time / 5) * 5));
  cook_time = Math.max(5, Math.min(180, Math.round(cook_time / 5) * 5));

  return { prep_time, cook_time };
}

let changed = 0;
const stats = { prep: 0, cook: 0, count: 0 };

for (const recipe of db.recipes) {
  const { prep_time, cook_time } = estimateTimes(recipe);
  if (recipe.prep_time !== prep_time || recipe.cook_time !== cook_time) {
    recipe.prep_time = prep_time;
    recipe.cook_time = cook_time;
    changed++;
  }
  stats.prep += prep_time;
  stats.cook += cook_time;
  stats.count++;
}

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
console.log('Updated', changed, 'recipes');
console.log('Avg prep:', Math.round(stats.prep / stats.count), 'min');
console.log('Avg cook:', Math.round(stats.cook / stats.count), 'min');

// Show samples
const samples = db.recipes.slice(0, 5);
samples.forEach(r => console.log(r.name, 'prep:', r.prep_time, 'cook:', r.cook_time, 'steps:', r.steps.length, 'ings:', r.ingredients.length));