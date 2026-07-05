import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');

const categories = [
  { id: '1', name: '家常菜', created_at: new Date().toISOString() },
  { id: '2', name: '川菜', created_at: new Date().toISOString() },
  { id: '3', name: '粤菜', created_at: new Date().toISOString() },
  { id: '4', name: '湘菜', created_at: new Date().toISOString() },
  { id: '5', name: '甜品', created_at: new Date().toISOString() },
  { id: '6', name: '汤羹', created_at: new Date().toISOString() },
  { id: '7', name: '主食', created_at: new Date().toISOString() },
  { id: '8', name: '其他', created_at: new Date().toISOString() },
];

const initData = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(CATEGORIES_FILE)) {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2));
  }
};

initData();

const readRecipes = () => {
  if (!fs.existsSync(RECIPES_FILE)) {
    return [];
  }
  const data = fs.readFileSync(RECIPES_FILE, 'utf8');
  return JSON.parse(data);
};

const writeRecipes = (recipes) => {
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
};

app.use(express.json({ limit: '10mb' }));

app.get('/api/categories', (req, res) => {
  res.json(categories);
});

app.get('/api/recipes', (req, res) => {
  const recipes = readRecipes();
  res.json(recipes);
});

app.post('/api/recipes', (req, res) => {
  const { name, category, image_url, ingredients, steps, prep_time, cook_time } = req.body;
  
  if (!name || !category) {
    return res.status(400).json({ error: '菜谱名称和分类不能为空' });
  }

  const recipes = readRecipes();
  const existingRecipe = recipes.find(r => r.name === name);
  if (existingRecipe) {
    return res.status(400).json({ error: '该菜谱已存在' });
  }

  const newRecipe = {
    id: Date.now().toString(),
    name,
    category,
    image_url: image_url || '',
    ingredients: ingredients || [],
    steps: steps || [],
    prep_time: prep_time || 0,
    cook_time: cook_time || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  recipes.unshift(newRecipe);
  writeRecipes(recipes);
  res.json(newRecipe);
});

app.put('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  const { name, category, image_url, ingredients, steps, prep_time, cook_time } = req.body;

  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  if (name !== recipes[index].name) {
    const existingRecipe = recipes.find(r => r.name === name && r.id !== id);
    if (existingRecipe) {
      return res.status(400).json({ error: '该菜谱名称已存在' });
    }
  }

  recipes[index] = {
    ...recipes[index],
    name,
    category,
    ...(image_url && { image_url }),
    ingredients: ingredients || [],
    steps: steps || [],
    prep_time: prep_time || 0,
    cook_time: cook_time || 0,
    updated_at: new Date().toISOString(),
  };

  writeRecipes(recipes);
  res.json(recipes[index]);
});

app.delete('/api/recipes/:id', (req, res) => {
  const { id } = req.params;

  const recipes = readRecipes();
  const index = recipes.findIndex(r => r.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: '菜谱不存在' });
  }

  const deletedRecipe = recipes.splice(index, 1)[0];
  writeRecipes(recipes);
  res.json(deletedRecipe);
});

app.get('/api/admin/config', (req, res) => {
  res.json({
    adminPhone: process.env.ADMIN_PHONE || '',
  });
});

app.post('/api/admin/login', (req, res) => {
  const { phone, password } = req.body;
  const adminPhone = process.env.ADMIN_PHONE;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (phone === adminPhone && password === adminPassword) {
    res.json({
      success: true,
      token: 'admin_token_' + Date.now(),
    });
  } else {
    res.json({
      success: false,
      message: '账号或密码错误',
    });
  }
});

app.use('/api/ai', async (req, res) => {
  try {
    const { method, body, originalUrl } = req;
    const apiPath = originalUrl.replace(/^\/api\/ai/, '');
    const apiUrl = `https://tokenhub.tencentmaas.com/v1${apiPath}`;
    const apiKey = process.env.AI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'AI API Key not configured' });
    }

    const response = await fetch(apiUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('API proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use(express.static(path.join(__dirname, 'dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});