'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, KeyRound, Pencil } from 'lucide-react';

interface User {
  id: number;
  username: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState<number | null>(null);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/users');
      const json = await res.json();
      if (json.data) setUsers(json.data);
    } catch {
      toast.error('Kullanıcılar yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const json = await res.json();
      if (json.data?.success) {
        toast.success('Kullanıcı eklendi.');
        setShowAddModal(false);
        setNewUsername('');
        setNewPassword('');
        fetchUsers();
      } else {
        toast.error(json.data?.error || 'Kullanıcı eklenemedi.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingUser.id, username: editUsername }),
      });
      const json = await res.json();
      if (json.data?.success) {
        toast.success('Kullanıcı adı güncellendi.');
        setEditingUser(null);
        fetchUsers();
      } else {
        toast.error(json.data?.error || 'Kullanıcı adı güncellenemedi.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`${user.username} kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      });
      const json = await res.json();
      if (json.data?.success) {
        toast.success('Kullanıcı silindi.');
        fetchUsers();
      } else {
        toast.error(json.data?.error || 'Kullanıcı silinemedi.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: showPasswordModal, currentPassword, newPassword: changeNewPassword }),
      });
      const json = await res.json();
      if (json.data?.success) {
        toast.success('Şifre değiştirildi.');
        setShowPasswordModal(null);
        setCurrentPassword('');
        setChangeNewPassword('');
      } else {
        toast.error(json.data?.error || 'Şifre değiştirilemedi.');
      }
    } catch {
      toast.error('Bir hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditUsername(user.username);
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Yükleniyor...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kullanıcılar</h1>
          <p className="text-slate-500 mt-1">Admin paneline erişebilecek kullanıcıları yönetin.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Yeni Kullanıcı
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-500">ID</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-500">Kullanıcı Adı</th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-slate-500">Oluşturulma</th>
              <th className="text-right py-4 px-6 text-sm font-semibold text-slate-500">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="py-4 px-6 text-sm text-slate-700">{user.id}</td>
                <td className="py-4 px-6 text-sm font-medium text-slate-800">{user.username}</td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString('tr-TR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Kullanıcı Adını Düzenle"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(user.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Şifre Değiştir"
                    >
                      <KeyRound size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      title="Kullanıcıyı Sil"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  Henüz kullanıcı bulunmuyor.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Yeni Kullanıcı Ekle</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Ekleniyor...' : 'Ekle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Kullanıcı Adını Düzenle</h2>
            <form onSubmit={handleEditUsername} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(null)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Şifre Değiştir</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mevcut Şifre</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Yeni Şifre</label>
                <input
                  type="password"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  autoComplete="new-password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Değiştiriliyor...' : 'Değiştir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
