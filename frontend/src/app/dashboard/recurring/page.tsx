'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Repeat, Plus, Bell, CheckCircle2, XCircle, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/Toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { getLimits } from '@/lib/plan-limits';
import type { RecurringExpense } from '@/types';

export default function RecurringPage() {
  const { user } = useAuth();
  const limits = getLimits(user?.plan ?? 'FREE');
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!limits.recurring) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
        <div className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-10 h-10 text-primary" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight mb-2">Función Premium</h1>
          <p className="text-muted-foreground font-medium max-w-sm">
            Los pagos recurrentes están disponibles a partir del plan Premium. Automatiza tus suscripciones y gastos fijos.
          </p>
        </div>
        <button
          onClick={() => setUpgradeOpen(true)}
          className="flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-black font-black px-8 py-4 rounded-3xl shadow-xl shadow-amber-400/20 transition-all active:scale-95"
        >
          <Zap className="w-5 h-5" />
          Subir a Premium
        </button>
        <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={user?.plan ?? 'FREE'} reason="Desbloquea pagos recurrentes y mucho más con Premium." />
      </div>
    );
  }
  const { success, error: toastError } = useToast();
  const [expenses, setExpenses] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newExp, setNewExp] = useState({ descripcion: '', monto: '', diaDelMes: '', tipo: 'GASTO' });

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/recurring-expenses');
      setExpenses(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (error) {
      console.error('Error fetching recurring expenses', error);
      toastError('Error al cargar los pagos recurrentes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side validation
    const monto = Number(newExp.monto);
    const dia = Number(newExp.diaDelMes);
    if (!newExp.descripcion.trim()) {
      toastError('La descripción es obligatoria');
      return;
    }
    if (isNaN(monto) || monto <= 0) {
      toastError('El monto debe ser un número mayor a 0');
      return;
    }
    if (isNaN(dia) || dia < 1 || dia > 31) {
      toastError('El día de cobro debe estar entre 1 y 31');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/recurring-expenses', {
        ...newExp,
        monto,
        diaDelMes: dia
      });
      setIsModalOpen(false);
      setNewExp({ descripcion: '', monto: '', diaDelMes: '', tipo: 'GASTO' });
      success('Suscripción guardada correctamente');
      fetchExpenses();
    } catch (error) {
      console.error('Error creating recurring expense', error);
      toastError('Error al guardar la suscripción');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: number, currentActive: boolean) => {
    try {
      await api.patch(`/recurring-expenses/${id}/toggle`, { isActive: !currentActive });
      success(currentActive ? 'Suscripción desactivada' : 'Suscripción activada');
      fetchExpenses();
    } catch (error) {
      console.error('Error toggling expense', error);
      toastError('Error al actualizar la suscripción');
    }
  };

  if (loading) return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );

  const totalMonthly = expenses
    .filter(e => e.isActive)
    .reduce((acc, curr) => acc + Number(curr.monto), 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Pagos Recurrentes</h1>
          <p className="text-muted-foreground font-medium">Automatiza y monitorea tus suscripciones y gastos fijos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Nueva Suscripción
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nueva Suscripción"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
            <input 
              required
              value={newExp.descripcion}
              onChange={(e) => setNewExp({...newExp, descripcion: e.target.value})}
              placeholder="Ej: Netflix, Gym, Alquiler..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto Mensual</label>
                <input
                  type="number"
                  required
                  value={newExp.monto}
                  onChange={(e) => setNewExp({...newExp, monto: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Día de Cobro</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={newExp.diaDelMes}
                  onChange={(e) => setNewExp({...newExp, diaDelMes: e.target.value})}
                  placeholder="1-31"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
            <select
              value={newExp.tipo}
              onChange={e => setNewExp({ ...newExp, tipo: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            >
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            {submitting ? 'Guardando...' : 'Guardar Suscripción'}
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
                {expenses.map((exp) => (
                    <RecurringCard 
                        key={exp.id} 
                        item={exp} 
                        onToggle={() => handleToggle(exp.id, exp.isActive)} 
                    />
                ))}
            </AnimatePresence>
            {expenses.length === 0 && (
                <div className="py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                    <Repeat className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                    <p className="text-xl font-bold">No tienes pagos recurrentes</p>
                </div>
            )}
        </div>

        <aside className="space-y-6">
            <div className="glass p-8 rounded-[40px] border border-white/5 bg-primary/5">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Próximos Pagos</h3>
                <div className="space-y-4">
                    {expenses.filter(e => e.isActive).slice(0, 3).map(e => (
                        <UpcomingItem key={e.id} title={e.descripcion} day={e.diaDelMes} amount={Number(e.monto)} />
                    ))}
                    {expenses.filter(e => e.isActive).length === 0 && (
                         <p className="text-xs text-muted-foreground italic">Sin pagos activos para este mes.</p>
                    )}
                </div>
            </div>
            
            <div className="glass p-8 rounded-[40px] border border-white/5">
                <h3 className="font-bold mb-2 text-sm uppercase tracking-widest text-muted-foreground">Total Mensual Proyectado</h3>
                <p className="text-5xl font-black tracking-tighter text-primary">${totalMonthly.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-4 font-medium italic underline underline-offset-4 decoration-primary/30">Cálculo basado en {expenses.filter(e => e.isActive).length} suscripciones activas.</p>
            </div>
        </aside>
      </div>
    </div>
  );
}

function RecurringCard({ item, onToggle }: any) {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`glass p-8 rounded-[36px] border flex items-center justify-between group cursor-pointer transition-all ${item.isActive ? 'border-white/5 hover:border-primary/30' : 'bg-black/40 grayscale opacity-60 border-white/5'}`}
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${item.isActive ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-muted-foreground border-white/10'}`}>
                    <Repeat className="w-7 h-7" />
                </div>
                <div>
                    <h4 className="text-xl font-black tracking-tight">{item.descripcion}</h4>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Cobro los días {item.diaDelMes}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-10">
                <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Monto</p>
                    <p className="text-2xl font-black">${Number(item.monto).toLocaleString()}</p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  aria-label={item.isActive ? "Desactivar gasto recurrente" : "Activar gasto recurrente"}
                  className={`p-3 rounded-2xl transition-all ${item.isActive ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'}`}
                >
                    {item.isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </button>
            </div>
        </motion.div>
    )
}

function UpcomingItem({ title, day, amount }: any) {
    return (
        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-[10px] font-medium text-muted-foreground">Día {day}</p>
            </div>
            <p className="font-black text-sm text-primary">${amount.toLocaleString()}</p>
        </div>
    )
}
