'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Shield, User, Crown, Search, Check, X, ArrowUpRight, Edit2, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ nombre: '', email: '', password: '', plan: '' });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePlan = async (userId: number, newPlan: string) => {
    try {
      await api.patch(`/admin/users/${userId}/plan`, { plan: newPlan });
      fetchUsers();
    } catch (error) {
      console.error('Error updating plan', error);
    }
  };

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setEditFormData({ nombre: user.nombre, email: user.email, password: '', plan: user.plan });
    setIsEditModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToUpdate: any = { ...editFormData };
      if (!dataToUpdate.password) delete dataToUpdate.password;
      
      await api.patch(`/admin/users/${selectedUser.id}`, dataToUpdate);
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user', error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="animate-pulse">Cargando panel de administración...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center border border-primary/30">
                <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-black tracking-tight">Admin Central</h1>
          </div>
          <p className="text-muted-foreground font-medium">Gestiona roles, planes y el pulso de la plataforma.</p>
        </div>

        <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar usuarios..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
            />
        </div>
      </header>

      <div className="glass rounded-[40px] border border-white/5 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-white/[0.02] border-b border-white/5">
                <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Usuario</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plan Actual</th>
                    <th className="px-8 py-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Acciones</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                                    <User className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="font-black text-sm">{u.nombre}</p>
                                    <p className="text-xs text-muted-foreground font-medium">{u.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-6">
                            <span className={`
                                px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-xl
                                ${u.plan === 'FREE' ? 'bg-zinc-200/5 text-zinc-300 border-zinc-500/30 shadow-black/20' : 
                                  u.plan === 'PREMIUM' ? 'bg-amber-400 text-amber-950 border-amber-300 shadow-amber-500/20' : 
                                  'bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20'}
                            `}>
                                {u.plan === 'ELITE' ? '✨ ' + u.plan : u.plan}
                            </span>
                        </td>
                        <td className="px-8 py-6">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleEditClick(u)}
                                    className="p-2 hover:bg-white/5 rounded-xl text-white transition-all active:scale-95"
                                    title="Edit User"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleUpdatePlan(u.id, 'ELITE')}
                                    className="p-2 hover:bg-indigo-500/10 rounded-xl text-indigo-400 transition-all active:scale-95"
                                    title="Upgrade to Elite"
                                >
                                    <Shield className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={() => handleUpdatePlan(u.id, 'PREMIUM')}
                                    className="p-2 hover:bg-amber-500/10 rounded-xl text-amber-400 transition-all active:scale-95"
                                    title="Upgrade to Premium"
                                >
                                    <Crown className="w-5 h-5 shadow-sm" />
                                </button>
                                <button 
                                    onClick={() => handleUpdatePlan(u.id, 'FREE')}
                                    className="p-2 hover:bg-white/5 rounded-xl text-zinc-100 transition-all active:scale-95"
                                    title="Downgrade to Free"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
        {filteredUsers.length === 0 && (
            <div className="py-20 text-center">
                <p className="text-muted-foreground font-bold">No se encontraron usuarios.</p>
            </div>
        )}
      </div>

      <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
              <Info className="text-primary w-5 h-5" />
          </div>
          <div className="text-sm">
              <p className="font-black mb-1 text-zinc-100">Guía del Sistema</p>
              <p className="text-muted-foreground leading-relaxed font-medium">
                  Los planes <span className="text-zinc-100 font-bold">FREE</span> y <span className="text-amber-400 font-bold">PREMIUM</span> limitan el volumen de transacciones y herramientas avanzadas. 
                  El plan <span className="text-indigo-400 font-bold italic">✨ ELITE</span> es el nivel máximo de usuario. Los <span className="underline decoration-indigo-500/50 text-indigo-300">Administradores</span> pueden gestionar cualquier cuenta independientemente de su plan.
              </p>
          </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={`Editar Usuario: ${selectedUser?.nombre}`}
      >
        <form onSubmit={handleSaveUser} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Nombre</label>
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary"
                        value={editFormData.nombre}
                        onChange={(e) => setEditFormData({...editFormData, nombre: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Plan</label>
                    <select 
                        className="w-full bg-[#111] border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary appearance-none"
                        value={editFormData.plan}
                        onChange={(e) => setEditFormData({...editFormData, plan: e.target.value})}
                    >
                        <option value="FREE">FREE</option>
                        <option value="PREMIUM">PREMIUM</option>
                        <option value="ELITE">ELITE</option>
                    </select>
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email</label>
                <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2 italic">Cambiar Contraseña (opcional)</label>
                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="password"
                        placeholder="Dejar vacío para no cambiar"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex gap-4 pt-4">
                <button type="submit" className="flex-1 bg-primary py-4 rounded-2xl font-black text-white hover:scale-[1.02] transition-all shadow-xl shadow-primary/20">
                    Guardar Cambios
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all text-sm">
                    Cancelar
                </button>
            </div>
        </form>
      </Modal>
    </div>
  );
}
