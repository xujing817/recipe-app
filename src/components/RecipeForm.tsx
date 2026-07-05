import { useState, useEffect } from 'react';
import { X, ImagePlus, Plus, Minus, Clock, ChefHat, Sparkles, FileText } from 'lucide-react';
import { Category, Recipe } from '@/types';
import { generateRecipeFromText } from '@/utils/ai';

interface RecipeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    image: File | null;
    ingredients: string[];
    steps: string[];
    prep_time: number;
    cook_time: number;
  }) => Promise<boolean>;
  categories: Category[];
  recipe?: Recipe | null;
}

export const RecipeForm = ({ isOpen, onClose, onSubmit, categories, recipe }: RecipeFormProps) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>(['']);
  const [steps, setSteps] = useState<string[]>(['']);
  const [prepTime, setPrepTime] = useState(0);
  const [cookTime, setCookTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (recipe) {
        setName(recipe.name);
        setCategory(recipe.category);
        setImagePreview(recipe.image_url);
        setIngredients([...recipe.ingredients]);
        setSteps([...recipe.steps]);
        setPrepTime(recipe.prep_time);
        setCookTime(recipe.cook_time);
      } else {
        resetForm();
      }
    }
  }, [isOpen, recipe]);

  const resetForm = () => {
    setName('');
    setCategory(categories[0]?.name || '');
    setImage(null);
    setImagePreview('');
    setIngredients(['']);
    setSteps(['']);
    setPrepTime(0);
    setCookTime(0);
    setAiText('');
    setAiError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };

  const handleAiGenerate = async () => {
    if (!aiText.trim()) {
      setAiError('请粘贴菜谱内容');
      return;
    }

    setAiError('');
    setAiLoading(true);

    const result = await generateRecipeFromText(aiText);

    if (result && result.name) {
      setName(result.name);
      setCategory(result.category || categories[0]?.name || '');
      setIngredients(result.ingredients.length > 0 ? result.ingredients : ['']);
      setSteps(result.steps.length > 0 ? result.steps : ['']);
      setPrepTime(result.prep_time || 0);
      setCookTime(result.cook_time || 0);
      setAiText('');
    } else {
      setAiError('AI 无法分析菜谱内容，请检查内容是否完整');
      setName('');
      setCategory(categories[0]?.name || '');
      setIngredients(['']);
      setSteps(['']);
      setPrepTime(0);
      setCookTime(0);
    }

    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validIngredients = ingredients.filter(i => i.trim());
    const validSteps = steps.filter(s => s.trim());
    
    if (!name.trim() || !category || validIngredients.length === 0 || validSteps.length === 0) {
      alert('请填写完整信息');
      return;
    }

    setLoading(true);
    const success = await onSubmit({
      name: name.trim(),
      category,
      image,
      ingredients: validIngredients,
      steps: validSteps,
      prep_time: prepTime,
      cook_time: cookTime,
    });
    setLoading(false);
    
    if (success) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            {recipe ? '编辑菜谱' : '添加新菜谱'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜谱名称
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入菜谱名称"
              className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              菜谱图片 {recipe && '(不修改则保持原图片)'}
            </label>
            <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
              ) : (
                <label className="flex flex-col items-center gap-2 text-gray-400 cursor-pointer hover:text-lightgreen transition-colors">
                  <ImagePlus className="w-10 h-10" />
                  <span className="text-sm">点击上传图片</span>
                </label>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                准备时间(分钟)
              </label>
              <input
                type="number"
                value={prepTime}
                onChange={(e) => setPrepTime(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                烹饪时间(分钟)
              </label>
              <input
                type="number"
                value={cookTime}
                onChange={(e) => setCookTime(Number(e.target.value))}
                min="0"
                className="w-full px-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">配料清单</label>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center gap-1 text-sm text-lightgreen hover:text-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加配料
              </button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => updateIngredient(index, e.target.value)}
                    placeholder={`配料 ${index + 1}`}
                    className="flex-1 px-4 py-2 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">烹饪步骤</label>
              <button
                type="button"
                onClick={addStep}
                className="flex items-center gap-1 text-sm text-lightgreen hover:text-green-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                添加步骤
              </button>
            </div>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <span className="w-8 h-8 bg-lightgreen text-gray-800 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    {index + 1}
                  </span>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`步骤 ${index + 1}`}
                    rows={2}
                    className="flex-1 px-4 py-2 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent resize-none"
                  />
                  {steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-lightgreen" />
              <h3 className="text-lg font-semibold text-gray-800">AI 智能导入</h3>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              将菜谱网页中的文字内容复制粘贴到下方文本框，AI 将自动提取菜谱信息
            </p>
            <div className="flex flex-col gap-3">
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <textarea
                  value={aiText}
                  onChange={(e) => setAiText(e.target.value)}
                  placeholder="在此粘贴菜谱网页内容，包括菜名、食材、做法等..."
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 text-base bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lightgreen focus:border-transparent resize-none"
                />
              </div>
              <button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                className="self-end px-8 py-3 bg-gradient-to-r from-lightgreen to-green-400 text-gray-800 font-bold text-base rounded-xl hover:from-green-300 hover:to-green-500 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
              >
                {aiLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin" />
                    分析中
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    AI 分析
                  </>
                )}
              </button>
            </div>
            {aiError && (
              <p className="mt-2 text-sm text-red-500">{aiError}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 font-medium text-base rounded-xl hover:bg-gray-200 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-lightgreen text-gray-800 font-bold text-base rounded-xl hover:bg-green-300 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};