'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Wallet, Plus, ArrowUpRight, TrendingUp, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { useAuth } from '@/context/AuthContext';

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAcc, setNewAcc] = useState({ nombre: '', saldoActual: 0, tipo: 'DEBITO' });

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
        ...newAcc, 
        saldoActual: Number(newAcc.saldoActual) 
      });
      setIsModalOpen(false);
      setNewAcc({ nombre: '', saldoActual: 0, tipo: 'DEBITO' });
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account', error);
    }
  };

  if (loading) return <div className="animate-pulse">Cargando cuentas...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Mis Cuentas</h1>
          <p className="text-muted-foreground font-medium">Gestiona tus activos y fuentes de capital.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Nueva Cuenta
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nueva Cuenta"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre de la Cuenta</label>
            <input 
              required
              value={newAcc.nombre}
              onChange={(e) => setNewAcc({...newAcc, nombre: e.target.value})}
              placeholder="Ej: Banco Estado, Wallet BTC..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Saldo Inicial</label>
                <input 
                  type="number"
                  required
                  value={newAcc.saldoActual}
                  onChange={(e) => setNewAcc({...newAcc, saldoActual: Number(e.target.value)})}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                <select 
                    value={newAcc.tipo}
                    onChange={(e) => setNewAcc({...newAcc, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="DEBITO" className="bg-zinc-900">Débito</option>
                    <option value="CREDITO" className="bg-zinc-900">Crédito</option>
                    <option value="EFECTIVO" className="bg-zinc-900">Efectivo</option>
                    <option value="INVERSION" className="bg-zinc-900">Inversión</option>
                </select>
              </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            Crear Cuenta
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {accounts.map((acc) => (
          <AccountCard key={acc.id} account={acc} />
        ))}
        {accounts.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                <Wallet className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                <p className="text-xl font-bold">No tienes cuentas registradas</p>
                <p className="text-muted-foreground">¡Crea tu primera cuenta para empezar!</p>
            </div>
        )}
      </div>
    </div>
  );
}

function AccountCard({ account }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="glass p-10 rounded-[40px] border border-white/5 relative overflow-hidden group hover:border-primary/40 transition-all bg-gradient-to-br from-white/5 to-transparent shadow-2xl"
    >
      <div className="flex justify-between items-start mb-10">
        <div className="p-5 rounded-[24px] bg-primary/10 text-primary border border-primary/20 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
          <Wallet className="w-8 h-8" />
        </div>
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">{account.tipo}</p>
        <h3 className="text-2xl font-black tracking-tight">{account.nombre}</h3>
      </div>

      <div className="mt-10 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Saldo Actual</p>
          <p className="text-4xl font-black tracking-tighter">${account.saldoActual.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-xs font-black">
          <TrendingUp className="w-4 h-4" /> 2.4%
        </div>
      </div>
      
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-[80px] -translate-x-12 -translate-y-12 pointer-events-none group-hover:bg-primary/10 transition-all" />
    </motion.div>
  );
}
