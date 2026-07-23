// Patch script: apply changes to original server.js
const fs = require('fs');
const path = require('path');

const orig = fs.readFileSync(path.join(__dirname, '..', 'data', 'server_orig.js'), 'utf-8');
const lines = orig.split('\n');

// This approach is too fragile. Let me just rewrite server.js properly.
// I'll compose the full server.js with all features.

const server = `import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'recipe-app-secret-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || '1982141680';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '421302';

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default categories (only used if db.json doesn't exist)
const defaultCategories = [
  { id: '1', name: '家常菜', created_at: new Date().toISOString() },
  { id: '2', name: '川菜', created_at: new Date().toISOString() },
  { id: '3', name: '粤菜', created_at: new Date().toISOString() },
  { id: '4', name: '湘菜', created_at: new Date().toISOString() },
  { id: '5', name: '甜品', created_at: new Date().toISOString() },
  { id: '6', name: '汤羹', created_at: new Date().toISOString() },
  { id: '7', name: '主食', created_at: new Date().toISOString() },
  { id: '8', name: '其他', created_at: new Date().toISOString() },
];

const sampleRecipes = [{ id: '1', name: 'Sample', category: 'Test', image_url: '', ingredients: ['a'], steps: ['s'], prep_time: 10, cook_time: 10, created_at: '2026-01-01T00:00:00.000Z', updated_at: '2026-01-01T00:00:00.000Z' }];

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ============ Database helpers ============
const readDb = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = { users: [], recipes: sampleRecipes, categories: defaultCategories, menus: [] };
      const adminHash = bcrypt.hashSync(ADMIN_PASSWORD, 10);
      init.users.push({ id: 'admin-1', username: ADMIN_USERNAME, password_hash: adminHash, role: 'admin', created_at: new Date().toISOString() });
      fs.mkdirSync(DATA_DIR, { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  } catch (e) { console.error('DB read error:', e); return { users: [], recipes: [], categories: [], menus: [] }; }
};

const writeDb = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// ============ Auth middleware ============
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '无权限' });
  }
  next();
};

// ============ Auth API ============
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const db = readDb();
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: '该用户名已存在' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: 'user-' + Date.now(), username, password_hash: hash, role: 'user', created_at: new Date().toISOString() };
    db.users.push(user);
    writeDb(db);
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch { res.status(500).json({ error: '注册失败' }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: '账号或密码错误' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch { res.status(500).json({ error: '登录失败' }); }
});

// ============ User management API ============
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const db = readDb();
    const users = db.users.map(({ id, username, role, created_at }) => ({ id, username, role, created_at }));
    res.json(users);
  } catch { res.status(500).json({ error: '获取用户列表失败' }); }
});

app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }
    const db = readDb();
    if (db.users.find(u => u.username === username)) {
      return res.status(400).json({ error: '该用户名已存在' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = { id: 'user-' + Date.now(), username, password_hash: hash, role: role || 'user', created_at: new Date().toISOString() };
    db.users.push(user);
    writeDb(db);
    res.json({ id: user.id, username: user.username, role: user.role, created_at: user.created_at });
  } catch { res.status(500).json({ error: '添加失败' }); }
});

app.delete('/api/admin/users/:id', authMiddleware, adminMiddleware, (req, res) => {
  try {
    const db = readDb();
    const idx = db.users.findIndex(u => u.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: '用户不存在' });
    if (db.users[idx].role === 'admin') return res.status(400).json({ error: '不能删除管理员账户' });
    db.users.splice(idx, 1);
    writeDb(db);
    res.json({ success: true });
  } catch { res.status(500).json({ error: '删除失败' }); }
});

// ============ Recipes API ============
app.get('/api/recipes', (req, res) => {
  try {
    const db = readDb();
    res.json(db.recipes || []);
  } catch { res.status(500).json({ error: '获取菜谱列表失败' }); }
});

app.get('/api/categories', (req, res) => {
  try {
    const db = readDb();
    res.json(db.categories || []);
  } catch { res.status(500).json({ error: '获取分类失败' }); }
});

app.post('/api/recipes', authMiddleware, adminMiddleware, (req, res) => {
  const { name, category, image_url, ingredients, steps, prep_time, cook_time } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: '菜谱名称和分类不能为空' });
  }
  const db = readDb();
  if (db.recipes.find(r => r.name === name)) {
    return res.status(400).json({ error: '该菜谱已存在' });
  }
  const recipe = { id: Date.now().toString(), name, category, image_url: image_url || '', ingredients: ingredients || [], steps: steps || [], prep_time: prep_time || 0, cook_time: cook_time || 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  db.recipes.unshift(recipe);
  writeDb(db);
  res.json(recipe);
});

app.put('/api/recipes/:id', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDb();
  const recipe = db.recipes.find(r => r.id === req.params.id);
  if (!recipe) return res.status(404).json({ error: '菜谱不存在' });
  const { name, category, image_url, ingredients, steps, prep_time, cook_time } = req.body;
  if (name !== recipe.name && db.recipes.find(r => r.name === name && r.id !== req.params.id)) {
    return res.status(400).json({ error: '该菜谱名称已存在' });
  }
  Object.assign(recipe, { name, category, ingredients: ingredients || recipe.ingredients, steps: steps || recipe.steps, prep_time: prep_time ?? recipe.prep_time, cook_time: cook_time ?? recipe.cook_time, updated_at: new Date().toISOString() });
  if (image_url) recipe.image_url = image_url;
  writeDb(db);
  res.json(recipe);
});

app.delete('/api/recipes/:id', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDb();
  const idx = db.recipes.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '菜谱不存在' });
  db.recipes.splice(idx, 1);
  writeDb(db);
  res.json({ success: true });
});

// ============ Menu API ============
app.get('/api/menu', authMiddleware, (req, res) => {
  const db = readDb();
  const targetDate = req.query.date || new Date().toISOString().slice(0, 10);
  let menus = db.menus.filter(m => m.date === targetDate);
  if (req.user.role !== 'admin') {
    menus = menus.filter(m => m.user_id === req.user.id);
  }
  res.json(menus);
});

app.post('/api/menu', authMiddleware, (req, res) => {
  const { recipe_id, recipe_name } = req.body;
  if (!recipe_id || !recipe_name) return res.status(400).json({ error: '参数不完整' });
  const db = readDb();
  const today = new Date().toISOString().slice(0, 10);
  if (db.menus.find(m => m.user_id === req.user.id && m.recipe_id === recipe_id && m.date === today)) {
    return res.status(400).json({ error: '今天已经点过这道菜了' });
  }
  const recipe = db.recipes.find(r => r.id === recipe_id);
  const ingredientsStatus = {};
  if (recipe && recipe.ingredients) {
    recipe.ingredients.forEach(ing => { ingredientsStatus[ing] = false; });
  }
  const menuItem = { id: 'menu-' + Date.now(), recipe_id, recipe_name, user_id: req.user.id, username: req.user.username, date: today, created_at: new Date().toISOString(), ingredients_status: ingredientsStatus, all_ingredients_ready: false, completed: false };
  db.menus.push(menuItem);
  writeDb(db);
  res.json(menuItem);
});

app.put('/api/menu/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const db = readDb();
  const item = db.menus.find(m => m.id === req.params.id);
  if (!item) return res.status(404).json({ error: '菜单项不存在' });
  if (!item.ingredients_status) item.ingredients_status = {};
  const { ingredient, purchased, all_ingredients_ready, completed } = req.body;
  if (ingredient !== undefined && purchased !== undefined) {
    item.ingredients_status[ingredient] = purchased;
  }
  if (all_ingredients_ready !== undefined) {
    item.all_ingredients_ready = all_ingredients_ready;
    if (all_ingredients_ready) {
      Object.keys(item.ingredients_status).forEach(k => { item.ingredients_status[k] = true; });
    }
  }
  if (completed !== undefined) {
    item.completed = completed;
  }
  writeDb(db);
  res.json(item);
});

app.delete('/api/menu/:id', authMiddleware, (req, res) => {
  const db = readDb();
  const idx = db.menus.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '菜单项不存在' });
  if (req.user.role !== 'admin' && db.menus[idx].user_id !== req.user.id) {
    return res.status(403).json({ error: '无权限删除' });
  }
  db.menus.splice(idx, 1);
  writeDb(db);
  res.json({ success: true });
});

// ============ AI Proxy API ============
const AI_PROXY_TIMEOUT_MS = 120000;

app.use('/api/ai', authMiddleware, async (req, res) => {
  try {
    const { method, body, originalUrl } = req;
    const apiPath = originalUrl.replace(/^\/api\/ai/, '');
    const apiUrl = \`https://tokenhub.tencentmaas.com/v1\${apiPath}\`;
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI API Key not configured' });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => { controller.abort(); console.warn('AI timeout'); }, AI_PROXY_TIMEOUT_MS);
    const response = await fetch(apiUrl, { method, headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${apiKey}\` }, body: method !== 'GET' ? JSON.stringify(body) : undefined, signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    if (error.name === 'AbortError') {
      res.status(504).json({ error: 'AI 服务响应超时，请稍后重试' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// ============ Static files ============
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync(path.join(__dirname, '..', 'server.js'), server, 'utf-8');
console.log('server.js rewritten cleanly');