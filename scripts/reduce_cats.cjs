const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

// Category mapping: every existing category → 20 target categories
const categoryMap = {
  // ===== 1. 川菜 =====
  '川菜': '川菜',
  
  // ===== 2. 粤菜 =====
  '粤菜': '粤菜',
  
  // ===== 3. 湘菜 =====
  '湘菜': '湘菜',
  
  // ===== 4. 鲁菜 =====
  '鲁菜': '鲁菜',
  
  // ===== 5. 苏浙沪菜 =====
  '苏菜': '苏浙沪菜',
  '浙菜': '苏浙沪菜',
  '沪菜': '苏浙沪菜',
  '淮扬菜': '苏浙沪菜',
  '徽菜': '苏浙沪菜',
  '海派菜': '苏浙沪菜',
  
  // ===== 6. 北方菜 =====
  '京菜': '北方菜',
  '东北菜': '北方菜',
  '豫菜': '北方菜',
  '陕西菜': '北方菜',
  
  // ===== 7. 其他地方菜 =====
  '闽菜': '其他地方菜',
  '云南菜': '其他地方菜',
  '湖北菜': '其他地方菜',
  '民族菜': '其他地方菜',
  
  // ===== 8. 韩国料理 =====
  '韩国料理': '韩国料理',
  
  // ===== 9. 日本料理 =====
  '日本料理': '日本料理',
  
  // ===== 10. 异国料理 =====
  '其他西餐': '异国料理',
  '法国菜': '异国料理',
  '意大利菜': '异国料理',
  '东南亚风味': '异国料理',
  
  // ===== 11. 家常菜 =====
  '家常菜': '家常菜',
  '家常热菜': '家常菜',
  '家常凉菜': '家常菜',
  '家常主食': '家常菜',
  '家常西餐': '家常菜',
  '家常点心': '家常菜',
  '主食': '家常菜',
  '全荤': '家常菜',
  '半荤': '家常菜',
  '小荤': '家常菜',
  '素菜': '家常菜',
  '蔬菜类': '家常菜',
  '猪肉类': '家常菜',
  '牛羊肉类': '家常菜',
  '禽肉及其他肉类': '家常菜',
  '水产类': '家常菜',
  '鸡蛋及豆制品类': '家常菜',
  '凉菜类': '家常菜',
  
  // ===== 12. 快手菜 =====
  '微波炉菜': '快手菜',
  '方便食品': '快手菜',
  '保健菜肴': '快手菜',
  '风味食品': '快手菜',
  
  // ===== 13. 汤羹 =====
  '汤类': '汤羹',
  '汤煲类': '汤羹',
  
  // ===== 14. 饮品 =====
  '保健饮品': '饮品',
  '固体饮料': '饮品',
  '果酒': '饮品',
  '果汁及水': '饮品',
  '鸡尾茶': '饮品',
  '鸡尾酒': '饮品',
  '咖啡': '饮品',
  '奶制饮品': '饮品',
  '其它饮品': '饮品',
  '外国名酒': '饮品',
  '中国名茶': '饮品',
  '中国名酒': '饮品',
  
  // ===== 15. 凉拌小菜 =====
  '凉拌类': '凉拌小菜',
  '腌渍类': '凉拌小菜',
  '酱渍类': '凉拌小菜',
  '泡渍类': '凉拌小菜',
  '糖渍类': '凉拌小菜',
  '泡菜类': '凉拌小菜',
  
  // ===== 16. 母婴食谱 =====
  '婴儿': '母婴食谱',
  '幼儿': '母婴食谱',
  '孕产妇': '母婴食谱',
  '情人': '母婴食谱',
  
  // ===== 17. 健康轻食 =====
  '素食者': '健康轻食',
  '塑身美容': '健康轻食',
  '保健美容': '健康轻食',
  '更年期妇女': '健康轻食',
  '老年人': '健康轻食',
  
  // ===== 18. 药膳食疗 =====
  '补肝肾': '药膳食疗',
  '补气补血': '药膳食疗',
  '补阴补阳': '药膳食疗',
  '呼吸系统疾病': '药膳食疗',
  '神经系统疾病': '药膳食疗',
  '五官科疾病': '药膳食疗',
  '消化系统疾病': '药膳食疗',
  '循环系统疾病': '药膳食疗',
  '益寿': '药膳食疗',
  '肿瘤癌症': '药膳食疗',
  '糖尿病人菜肴': '药膳食疗',
  '其它': '药膳食疗',
  
  // ===== 19. 满汉全席 =====
  '第一道菜': '满汉全席',
  '第二道菜': '满汉全席',
  '第三道菜': '满汉全席',
  '第四道菜': '满汉全席',
  '第五道菜': '满汉全席',
  '第六道菜': '满汉全席',
  
  // ===== 20. 甜品点心 =====
  '甜品及点心类': '甜品点心',
};

// Read db.json
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Apply mapping to recipes
let changed = 0;
const unmapped = new Set();

for (const recipe of db.recipes) {
  const mapped = categoryMap[recipe.category];
  if (mapped) {
    if (recipe.category !== mapped) {
      recipe.category = mapped;
      changed++;
    }
  } else {
    unmapped.add(recipe.category);
  }
}

if (unmapped.size > 0) {
  console.log('WARNING: Unmapped categories:', [...unmapped]);
}

// Rebuild categories from actual recipe data
const catCounts = {};
const catFirstSeen = {};
for (const recipe of db.recipes) {
  catCounts[recipe.category] = (catCounts[recipe.category] || 0) + 1;
  if (!catFirstSeen[recipe.category]) {
    catFirstSeen[recipe.category] = recipe.created_at;
  }
}

// Replace categories array with only the 20 used ones
const ordered = ['川菜','粤菜','湘菜','鲁菜','苏浙沪菜','北方菜','其他地方菜','韩国料理','日本料理','异国料理','家常菜','快手菜','汤羹','饮品','凉拌小菜','母婴食谱','健康轻食','药膳食疗','满汉全席','甜品点心'];

db.categories = ordered.map((name, i) => ({
  id: 'cat-' + (i + 1),
  name: name,
  created_at: new Date().toISOString(),
}));

// Write back
fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

console.log(`Changed ${changed} recipe categories`);
console.log('Final category counts:');
ordered.forEach(name => {
  console.log(`  ${(catCounts[name]||0).toString().padStart(4)} - ${name}`);
});
console.log(`Total categories: ${ordered.length}`);
console.log(`Total recipes: ${db.recipes.length}`);
