import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Loader2 } from 'lucide-react';
import { User } from '@/types';

interface UserManagementProps {
  isOpen: boolean;
  onClose: () => void;
  getToken: () => string | null;
  isSuperAdmin: boolean;
}

export const UserManagement = ({ isOpen, onClose, getToken, isSuperAdmin }: UserManagementProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch { console.warn('获取用户列表失败'); }
    setLoading(false);
  };

  useEffect(() => { if (isOpen) fetchUsers(); }, [isOpen]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      setError('用户名和密码不能为空');
      return;
    }
    const token = getToken();
    if (!token) return;
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername.trim(), password: newPassword.trim() }),
      });
      if (res.ok) {
        const newUser = await res.json();
        setUsers(prev => [...prev, newUser]);
        setNewUsername('');
        setNewPassword('');
      } else {
        const data = await res.json();
        setError(data.error || '创建失败');
      }
    } catch { setError('网络错误'); }
    setCreating(false);
  };

  const handleDelete = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户"${username}"吗？`)) return;
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { setUsers(prev => prev.filter(u => u.id !== userId)); }
      else { const data = await res.json(); alert(data.error || '删除失败'); }
    } catch { alert('网络错误'); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">用户管理</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleCreate} className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-1">
              <Plus className="w-4 h-4" /> 创建新用户
            </h3>
            <div className="flex gap-2">
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)}
                placeholder="用户名"
                className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                placeholder="密码"
                className="flex-1 px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                {creating ? '创建中' : '创建'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-500 mb-2">共 {users.length} 个用户</p>
              {users.map(user => (
                <div key={user.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      user.role === 'admin' ? 'bg-red-400' : 'bg-blue-400'
                    }`}>
                      {user.username.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{user.username}</p>
                      <p className="text-xs text-gray-400">
                        {user.role === 'admin' ? '管理员' : '普通用户'} · {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                  {user.role !== 'admin' && (
                    <button onClick={() => handleDelete(user.id, user.username)}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
