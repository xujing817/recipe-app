import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Recipe, Category } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null = 
  SUPABASE_URL && SUPABASE_ANON_KEY 
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

export const mockCategories: Category[] = [
  { id: '1', name: '家常菜', created_at: new Date().toISOString() },
  { id: '2', name: '川菜', created_at: new Date().toISOString() },
  { id: '3', name: '粤菜', created_at: new Date().toISOString() },
  { id: '4', name: '湘菜', created_at: new Date().toISOString() },
  { id: '5', name: '甜品', created_at: new Date().toISOString() },
  { id: '6', name: '汤羹', created_at: new Date().toISOString() },
  { id: '7', name: '主食', created_at: new Date().toISOString() },
  { id: '8', name: '其他', created_at: new Date().toISOString() },
];

export const mockRecipes: Recipe[] = [
  {
    id: '1',
    name: '宫保鸡丁',
    category: '川菜',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Kung%20Pao%20Chicken%20with%20peanuts%20and%20dried%20chilies%20Chinese%20food%20professional%20photography&image_size=square',
    ingredients: ['鸡胸肉 200g', '花生米 50g', '干辣椒 10g', '花椒 5g', '葱姜蒜 适量', '生抽 2勺', '料酒 1勺', '糖 1勺', '醋 1勺', '盐 少许'],
    steps: [
      '鸡胸肉切丁，加入料酒、生抽、盐腌制15分钟',
      '花生米炸熟备用，干辣椒切段',
      '锅中倒油，油热后放入花椒和干辣椒炒香',
      '加入鸡丁快速翻炒至变色',
      '加入葱姜蒜继续翻炒',
      '倒入调好的酱汁（糖、醋、生抽、淀粉水）',
      '翻炒均匀后加入花生米',
      '最后撒上葱花即可出锅'
    ],
    prep_time: 20,
    cook_time: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: '红烧肉',
    category: '家常菜',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20braised%20pork%20belly%20hong%20shao%20rou%20glossy%20caramelized%20pork%20professional%20food%20photography&image_size=square',
    ingredients: ['五花肉 500g', '生姜 1块', '大葱 1根', '八角 2个', '桂皮 1小块', '香叶 2片', '料酒 3勺', '生抽 2勺', '老抽 1勺', '冰糖 30g', '盐 适量'],
    steps: [
      '五花肉切块，冷水下锅焯水，加入姜片和料酒',
      '焯水后捞出沥干水分',
      '锅中放少许油，加入冰糖小火炒出糖色',
      '放入五花肉翻炒上色',
      '加入葱姜八角桂皮香叶炒香',
      '加入生抽和老抽翻炒均匀',
      '加入热水没过肉，大火烧开后转小火慢炖60分钟',
      '最后大火收汁，加盐调味即可'
    ],
    prep_time: 15,
    cook_time: 75,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: '清蒸鲈鱼',
    category: '粤菜',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Steamed%20sea%20bass%20Chinese%20style%20with%20ginger%20scallion%20professional%20food%20photography&image_size=square',
    ingredients: ['鲈鱼 1条', '生姜 1块', '大葱 1根', '红椒 半个', '蒸鱼豉油 3勺', '料酒 1勺', '盐 少许', '食用油 适量'],
    steps: [
      '鲈鱼处理干净，两面划几刀便于入味',
      '用料酒和盐涂抹鱼身，腌制10分钟',
      '盘底铺姜片和葱段，放上鲈鱼',
      '鱼身上再铺一些姜丝和葱丝',
      '蒸锅水烧开后放入鱼，大火蒸8-10分钟',
      '取出鱼，倒掉蒸出的水分',
      '铺上新鲜葱丝和红椒丝',
      '淋上蒸鱼豉油',
      '烧热油浇在葱丝上激出香味即可'
    ],
    prep_time: 15,
    cook_time: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: '麻婆豆腐',
    category: '川菜',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mapo%20Tofu%20spicy%20Sichuan%20tofu%20with%20minced%20pork%20professional%20food%20photography&image_size=square',
    ingredients: ['嫩豆腐 1块', '猪肉末 100g', '豆瓣酱 2勺', '花椒粉 1勺', '葱姜蒜 适量', '生抽 1勺', '料酒 1勺', '淀粉水 适量', '盐 少许'],
    steps: [
      '豆腐切成小块，开水焯一下去除豆腥味',
      '锅中倒油，油热后放入猪肉末炒散',
      '加入豆瓣酱炒出红油',
      '加入葱姜蒜末炒香',
      '加入适量清水或高汤',
      '放入豆腐块，轻轻推匀',
      '加入生抽和盐调味',
      '小火煮5分钟后，倒入淀粉水勾芡',
      '出锅撒上花椒粉和葱花即可'
    ],
    prep_time: 10,
    cook_time: 15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: '糖醋排骨',
    category: '家常菜',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sweet%20and%20sour%20pork%20ribs%20Chinese%20food%20glossy%20professional%20food%20photography&image_size=square',
    ingredients: ['排骨 500g', '生姜 1块', '大葱 1根', '料酒 2勺', '生抽 2勺', '老抽 1勺', '香醋 3勺', '冰糖 40g', '盐 少许'],
    steps: [
      '排骨剁成小段，冷水下锅焯水',
      '焯水后捞出沥干水分',
      '锅中放油，加入冰糖小火炒出糖色',
      '放入排骨翻炒上色',
      '加入葱姜炒香',
      '加入料酒、生抽、老抽翻炒均匀',
      '加入热水没过排骨，大火烧开',
      '转小火炖30分钟',
      '加入香醋和盐调味',
      '大火收汁至浓稠即可'
    ],
    prep_time: 10,
    cook_time: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: '提拉米苏',
    category: '甜品',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Tiramisu%20Italian%20dessert%20with%20coffee%20soaked%20ladyfingers%20professional%20food%20photography&image_size=square',
    ingredients: ['马斯卡彭芝士 250g', '蛋黄 2个', '细砂糖 60g', '淡奶油 200ml', '咖啡液 100ml', '朗姆酒 1勺', '手指饼干 1包', '可可粉 适量'],
    steps: [
      '蛋黄加30g糖，隔热水打发至浓稠',
      '马斯卡彭芝士室温软化，加入蛋黄糊搅拌均匀',
      '淡奶油加剩余30g糖打发至6分发',
      '将淡奶油与芝士糊混合均匀',
      '咖啡液加入朗姆酒混合',
      '手指饼干快速蘸一下咖啡液',
      '铺一层蘸好的饼干在容器底部',
      '铺一层芝士糊',
      '重复铺饼干和芝士糊，最后一层是芝士糊',
      '冷藏4小时以上，吃前撒可可粉'
    ],
    prep_time: 30,
    cook_time: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const ADMIN_PHONE = '18329081624';
export const ADMIN_PASSWORD = '421302';