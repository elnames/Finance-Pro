'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Target, Plus, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Modal } from '@/components/ui/modal';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const now = new Date();
  const [dateFilter, setDateFilter] = useState({ mes: now.getMonth() + 1, anio: now.getFullYear() });
  const [newBudget, setNewBudget] = useState({ monto: '', categoryId: '' });

  const fetchData = async () => {
    try {
      const [budRes, catRes, txRes] = await Promise.all([
        api.get(`/budgets?mes=${dateFilter.mes}&anio=${dateFilter.anio}`),
        api.get('/categories'),
        api.get('/transactions')
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data.filter((c: any) => c.tipo === 'GASTO'));
      setTransactions(txRes.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/budgets', {
        ...newBudget,
        monto: Number(newBudget.monto),
        ...dateFilter
      });
      setIsModalOpen(false);
      setNewBudget({ monto: '', categoryId: '' });
      fetchData();
    } catch (error) {
      console.error('Error creating budget', error);
    }
  };

  const calculateSpent = (categoryId: number) => {
    return transactions
      .filter(tx => 
        tx.categoryId === categoryId && 
        tx.tipo === 'GASTO' &&
        new Date(tx.fecha).getMonth() + 1 === dateFilter.mes &&
        new Date(tx.fecha).getFullYear() === dateFilter.anio
      )
      .reduce((acc, curr) => acc + curr.monto, 0);
  };

  if (loading) return <div className="animate-pulse">Analizando tus metas...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Presupuestos</h1>
          <p className="text-muted-foreground font-medium">Controla tus gastos mensuales por categoría.</p>
        </div>
        <div className="flex gap-4">
            <select 
                value={dateFilter.mes} 
                onChange={(e) => setDateFilter({...dateFilter, mes: Number(e.target.value)})}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm font-bold"
            >
                {Array.from({length: 12}).map((_, i) => (
                    <option key={i+1} value={i+1} className="bg-zinc-900">{new Date(0, i).toLocaleString('es', {month: 'long'})}</option>
                ))}
            </select>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95"
            >
                <Plus className="w-6 h-6" />
                Definir Meta
            </button>
        </div>
      </header>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Establecer Presupuesto">
          <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                  <select 
                    required 
                    value={newBudget.categoryId} 
                    onChange={(e) => setNewBudget({...newBudget, categoryId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold"
                  >
                      <option value="" disabled className="bg-zinc-900">Seleccionar...</option>
                      {categories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>
                      ))}
                  </select>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto Máximo</label>
                  <input 
                    type="number" 
                    required 
                    value={newBudget.monto} 
                    onChange={(e) => setNewBudget({...newBudget, monto: e.target.value})}
                    placeholder="Ej: 500" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" 
                  />
              </div>
              <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black">Guardar Presupuesto</button>
          </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {budgets.map((bud) => {
              const spent = calculateSpent(bud.categoryId);
              const percent = Math.min((spent / bud.monto) * 100, 100);
              const isOver = spent > bud.monto;

              return (
                  <motion.div 
                    key={bud.id}
                    layout
                    className="glass p-8 rounded-[40px] border border-white/5 hover:border-primary/20 transition-all"
                  >
                      <div className="flex justify-between items-start mb-6">
                          <div>
                              <h4 className="text-xl font-black">{bud.category.nombre}</h4>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Presupuesto Mensual</p>
                          </div>
                          {isOver ? (
                              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg">
                                  <AlertCircle className="w-5 h-5" />
                              </div>
                          ) : (
                              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                  <CheckCircle2 className="w-5 h-5" />
                              </div>
                          )}
                      </div>

                      <div className="space-y-4">
                          <div className="flex justify-between items-end">
                              <p className="text-sm font-bold text-muted-foreground">Gastado: <span className={isOver ? 'text-rose-500' : 'text-foreground'}>${spent.toLocaleString()}</span></p>
                              <p className="text-sm font-bold text-muted-foreground">Límite: ${bud.monto.toLocaleString()}</p>
                          </div>
                          
                          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-primary'}`}
                              />
                          </div>

                          <p className="text-[10px] font-black uppercase tracking-widest text-right opacity-40">
                              {isOver ? 'Excedido' : `${Math.round(percent)}% utilizado`}
                          </p>
                      </div>
                  </motion.div>
              );
          })}

          {budgets.length === 0 && (
              <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                  <Target className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                  <p className="text-xl font-bold">No has definido presupuestos para este mes</p>
                  <p className="text-muted-foreground mt-2">Establece límites para ahorrar más efectivamente.</p>
              </div>
          )}
      </div>
    </div>
  );
}
