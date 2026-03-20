'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Wallet, Plus, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ nombre: '', saldoActual: '' });

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(res.data);
    } catch (error) {
      console.error('Error fetching accounts', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/accounts', { 
        nombre: newAcc.nombre,
        saldoActual: Number(newAcc.saldoActual) || 0
      });
      setIsModalOpen(false);
      setNewAcc({ nombre: '', saldoActual: '' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de eliminar esta cuenta? Se eliminarán también todas sus transacciones.')) {
      try {
        await api.delete(`/accounts/${id}`);
        fetchAccounts();
      } catch (error) {
        console.error('Error deleting account', error);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/accounts/${editAcc.id}`, {
        ...editAcc,
        saldoActual: Number(editAcc.saldoActual) || 0
      });
      setIsEditModalOpen(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error updating account', error);
    }
  };

  if (loading) return <div className="animate-pulse">Cargando tus activos...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Mis Cuentas</h1>
          <p className="text-muted-foreground font-medium">Gestiona tus bancos, billeteras y ahorros.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Nueva Cuenta
        </button>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Crear Nueva Cuenta">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre de la Cuenta</label>
            <input required value={newAcc.nombre} onChange={(e) => setNewAcc({...newAcc, nombre: e.target.value})} placeholder="Ej: BCP Personal, Billetera Efectivo..." className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner" />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Saldo Inicial</label>
                <input type="number" required value={newAcc.saldoActual} onChange={(e) => setNewAcc({...newAcc, saldoActual: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
              </div>
          </div>
          <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black">Crear Cuenta</button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Cuenta">
        {editAcc && (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
              <input required value={editAcc.nombre} onChange={(e) => setEditAcc({...editAcc, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Saldo</label>
                  <input type="number" required value={editAcc.saldoActual} onChange={(e) => setEditAcc({...editAcc, saldoActual: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                </div>
            </div>
            <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black">Guardar Cambios</button>
          </form>
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} onDelete={() => handleDelete(acc.id)} onEdit={() => { setEditAcc(acc); setIsEditModalOpen(true); }} />
        ))}
        {accounts.length === 0 && (
          <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
            <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
            <p className="text-xl font-bold">Aún no tienes cuentas registradas</p>
            <p className="text-muted-foreground mt-2">Agrega tu primera cuenta para empezar el control.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account, onDelete, onEdit }: any) {
  return (
    <div className="glass p-8 rounded-[40px] border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-all" />
      
      <div className="flex justify-between items-start mb-8">
        <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
          <Wallet className="w-8 h-8" />
        </div>
        <div className="flex gap-2">
          <button onClick={onEdit} className="p-3 hover:bg-white/10 rounded-2xl transition-all text-muted-foreground hover:text-white">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={onDelete} className="p-3 hover:bg-rose-500/10 rounded-2xl transition-all text-muted-foreground hover:text-rose-500">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Cuenta Activa</p>
        <h3 className="text-2xl font-black tracking-tight">{account.nombre}</h3>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Saldo Disponible</p>
        <p className="text-4xl font-black tracking-tighter text-foreground">${account.saldoActual.toLocaleString()}</p>
      </div>
    </div>
  );
}
