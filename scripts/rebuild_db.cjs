const fs = require('fs');
const path = require('path');

const MDB_PATH = path.join(__dirname, '..', 'data', 'mdb_export.json');
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

let raw = fs.readFileSync(MDB_PATH, 'utf-8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const mdbData = JSON.parse(raw);

// Clean ingredient names
for (const r of mdbData.recipes) {
  r.ingredients = r.ingredients
    .map(i => i.replace(/[。.]$/, '').replace(/等$/, '').replace(/、/g, '').trim())
    .filter(i => i.length > 0 && i !== '等');
}

// Categories to DELETE
const deleteCategories = new Set([
  'other','婴儿','幼儿','孕产妇','情人','素食者','老年人','更年期妇女',
  '补肝肾','补气补血','补阴补阳','呼吸系统疾病','神经系统疾病',
  '五官科疾病','消化系统疾病','循环系统疾病','益寿','肿瘤癌症',
  '糖尿病人菜肴','保健美容','塑身美容','其它',
  '第一道菜','第二道菜','第三道菜','第四道菜','第五道菜','第六道菜',
  '保健饮品','固体饮料','果酒','果汁及水','鸡尾茶','鸡尾酒',
  '咖啡','奶制饮品','其它饮品','外国名酒','中国名茶','中国名酒',
  '腌渍类','酱渍类','泡渍类','糖渍类','泡菜类',
]);

const keepMapping = {
  '川菜':'川菜','粤菜':'粤菜','湘菜':'湘菜','鲁菜':'鲁菜',
  '苏菜':'江浙菜','浙菜':'江浙菜','沪菜':'江浙菜','淮扬菜':'江浙菜','徽菜':'江浙菜','海派菜':'江浙菜',
  '京菜':'北方菜','东北菜':'北方菜','豫菜':'北方菜','陕西菜':'北方菜',
  '闽菜':'其他地方菜','云南菜':'其他地方菜','湖北菜':'其他地方菜','民族菜':'其他地方菜',
  '家常热菜':'家常菜','家常凉菜':'家常菜','家常主食':'家常菜','家常西餐':'家常菜','家常点心':'家常菜','家常菜':'家常菜',
  '素菜':'家常菜','全荤':'家常菜','半荤':'家常菜','小荤':'家常菜',
  '蔬菜类':'家常菜','猪肉类':'家常菜','牛羊肉类':'家常菜','禽肉及其他肉类':'家常菜','水产类':'家常菜','鸡蛋及豆制品类':'家常菜',
  '凉菜类':'家常菜','主食类':'家常菜',
  '汤类':'汤羹','汤煲类':'汤羹',
  '微波炉菜':'快手菜','方便食品':'快手菜','保健菜肴':'快手菜','风味食品':'快手菜',
  '凉拌类':'凉拌小菜',
  '韩国料理':'韩国料理','日本料理':'日本料理',
  '其他西餐':'西餐','法国菜':'西餐','意大利菜':'西餐','东南亚风味':'西餐',
  '甜品及点心类':'甜品点心',
};

let kept = 0, deleted = 0;
const finalRecipes = [];

for (const recipe of mdbData.recipes) {
  if (deleteCategories.has(recipe.category)) { deleted++; continue; }
  const mapped = keepMapping[recipe.category];
  if (!mapped) continue;
  recipe.category = mapped;
  if (typeof recipe.ingredients === 'string') {
    recipe.ingredients = recipe.ingredients.split(/[,，、；;]/).map(s=>s.trim()).filter(Boolean);
  }
  if (typeof recipe.steps === 'string') {
    recipe.steps = recipe.steps.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  }
  finalRecipes.push(recipe);
  kept++;
}

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
db.recipes = finalRecipes;
const finalCats = [...new Set(finalRecipes.map(r=>r.category))];
const finalOrder = ['川菜','粤菜','湘菜','鲁菜','江浙菜','北方菜','其他地方菜','家常菜','汤羹','快手菜','凉拌小菜','甜品点心'];
db.categories = finalOrder.filter(c=>finalCats.includes(c)).map((n,i)=>({id:'cat-'+(i+1),name:n,created_at:new Date().toISOString()}));

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
console.log('Kept:', kept, 'Deleted:', deleted);
const cc = {};
finalRecipes.forEach(r=>{cc[r.category]=(cc[r.category]||0)+1});
finalOrder.filter(c=>cc[c]).forEach(c=>console.log(cc[c],'-',c));
console.log('Total:', finalRecipes.length, 'recipes,', db.categories.length, 'categories');