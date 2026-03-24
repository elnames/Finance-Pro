'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Wallet, Plus, Trash2, Edit2, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/Toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { getLimits } from '@/lib/plan-limits';
import type { Account } from '@/types';

export default function AccountsPage() {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ nombre: '', saldoActual: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const fetchAccounts = async () => {
    try {
      const res = await api.get('/accounts');
      setAccounts(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      console.error('Error fetching accounts', err);
      toastError('Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAcc.nombre.trim()) {
      toastError('El nombre de la cuenta es obligatorio');
      return;
    }
    const saldo = Number(newAcc.saldoActual);
    if (isNaN(saldo)) {
      toastError('El saldo inicial debe ser un número válido');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/accounts', {
        nombre: newAcc.nombre.trim(),
        saldoActual: saldo
      });
      setIsModalOpen(false);
      setNewAcc({ nombre: '', saldoActual: '' });
      success('Cuenta creada correctamente');
      fetchAccounts();
    } catch (err) {
      console.error('Error creating account', err);
      toastError('Error al crear la cuenta');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/accounts/${id}`);
      success('Cuenta eliminada');
      fetchAccounts();
    } catch (err) {
      console.error('Error deleting account', err);
      toastError('Error al eliminar la cuenta');
    }
  };

  const requestDelete = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (pendingDeleteId !== null) handleDelete(pendingDeleteId);
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAcc) return;
    setEditSubmitting(true);
    try {
      await api.patch(`/accounts/${editAcc.id}`, {
        ...editAcc,
        saldoActual: Number(editAcc.saldoActual) || 0
      });
      setIsEditModalOpen(false);
      success('Cuenta actualizada');
      fetchAccounts();
    } catch (err) {
      console.error('Error updating account', err);
      toastError('Error al actualizar la cuenta');
    } finally {
      setEditSubmitting(false);
    }
  };

  const limits = getLimits(user?.plan ?? 'FREE');
  const atLimit = isFinite(limits.accounts) && accounts.length >= limits.accounts;

  const handleNewAccount = () => {
    if (atLimit) { setUpgradeOpen(true); return; }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Mis Cuentas</h1>
          <p className="text-muted-foreground font-medium">Gestiona tus bancos, billeteras y ahorros.</p>
          {isFinite(limits.accounts) && (
            <p className="text-xs text-muted-foreground font-bold mt-1">
              <span className={atLimit ? 'text-rose-400' : 'text-primary'}>{accounts.length}</span>
              <span> / {limits.accounts} cuentas</span>
            </p>
          )}
        </div>
        <button
          onClick={handleNewAccount}
          className={`text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl transition-all active:scale-95 ${atLimit ? 'bg-zinc-700 shadow-none cursor-pointer' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
        >
          {atLimit ? <Lock className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
          {atLimit ? 'Límite alcanzado' : 'Nueva Cuenta'}
        </button>
      </header>
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={user?.plan ?? 'FREE'} reason={`El plan ${user?.plan ?? 'FREE'} solo permite ${limits.accounts} cuenta${limits.accounts !== 1 ? 's' : ''}. Sube de plan para agregar más.`} />

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
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary disabled:opacity-60 disabled:cursor-not-allowed py-4 rounded-2xl font-black"
          >
            {submitting ? 'Creando...' : 'Crear Cuenta'}
          </button>
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
            <button
              type="submit"
              disabled={editSubmitting}
              className="w-full bg-primary disabled:opacity-60 disabled:cursor-not-allowed py-4 rounded-2xl font-black"
            >
              {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        )}
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {accounts.map((acc) => (
              <AccountCard key={acc.id} account={acc} onDelete={() => requestDelete(acc.id)} onEdit={() => { setEditAcc(acc); setIsEditModalOpen(true); }} />
            ))}
            {accounts.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                <p className="text-xl font-bold">Aún no tienes cuentas registradas</p>
                <p className="text-muted-foreground mt-2">Agrega tu primera cuenta para empezar el control.</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="¿Eliminar cuenta?"
        description="Se eliminarán también todas sus transacciones. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
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
          <button onClick={onEdit} aria-label="Editar cuenta" className="p-3 hover:bg-white/10 rounded-2xl transition-all text-muted-foreground hover:text-white">
            <Edit2 className="w-5 h-5" />
          </button>
          <button onClick={onDelete} aria-label="Eliminar cuenta" className="p-3 hover:bg-rose-500/10 rounded-2xl transition-all text-muted-foreground hover:text-rose-500">
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
        <p className="text-4xl font-black tracking-tighter text-foreground">${Number(account.saldoActual).toLocaleString()}</p>
      </div>
    </div>
  );
}
