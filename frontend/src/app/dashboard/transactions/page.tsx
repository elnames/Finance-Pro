'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Plus, Clock, MoreVertical, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ 
    monto: '', 
    tipo: 'GASTO', 
    descripcion: '', 
    accountId: '', 
    categoryId: '' 
  });
  const [editTx, setEditTx] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const PAGE_SIZE = 50;
  const [page, setPage] = useState(0);

  const fetchData = async (currentPage = page) => {
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        api.get('/transactions', { params: { skip: currentPage * PAGE_SIZE, take: PAGE_SIZE } }),
        api.get('/accounts'),
        api.get('/categories')
      ]);
      setTransactions(txRes.data);
      setAccounts(accRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...newTx,
        monto: Number(newTx.monto) || 0,
        accountId: Number(newTx.accountId),
        categoryId: Number(newTx.categoryId)
      });
      setIsModalOpen(false);
      setNewTx({ monto: '', tipo: 'GASTO', descripcion: '', accountId: '', categoryId: '' });
      fetchData(page);
    } catch (error) {
      console.error('Error creating transaction', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Eliminar esta transacción? El saldo de la cuenta será reversado.')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchData(page);
      } catch (error) {
        console.error('Error deleting transaction', error);
      }
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/transactions/${editTx.id}`, {
        descripcion: editTx.descripcion,
        monto: Number(editTx.monto) || 0,
        tipo: editTx.tipo,
        categoryId: Number(editTx.categoryId)
      });
      setIsEditModalOpen(false);
      fetchData(page);
    } catch (error) {
      console.error('Error updating transaction', error);
    }
  };

  const sanitizeCSVCell = (value: string | number): string => {
    const str = String(value);
    if (/^[=+\-@\t\r]/.test(str)) {
      return '\t' + str;
    }
    return str;
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Descripción', 'Tipo', 'Monto', 'Categoría', 'Cuenta'];
    const rows = filteredTransactions.map(tx => [
      sanitizeCSVCell(new Date(tx.fecha).toLocaleDateString()),
      sanitizeCSVCell(tx.descripcion),
      sanitizeCSVCell(tx.tipo),
      sanitizeCSVCell(tx.monto),
      sanitizeCSVCell(tx.category?.nombre || 'General'),
      sanitizeCSVCell(tx.account?.nombre || 'N/A')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory ? tx.categoryId === Number(filterCategory) : true;
    const matchesAccount = filterAccount ? tx.accountId === Number(filterAccount) : true;
    return matchesSearch && matchesCategory && matchesAccount;
  });

  if (loading) return <div className="animate-pulse">Sincronizando movimientos...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Transacciones</h1>
          <p className="text-muted-foreground font-medium">Historial detallado de tu flujo de caja.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:w-64 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input 
              placeholder="Buscar movimientos..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-medium"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-6 h-6" />
            Nuevo
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl border transition-all ${showFilters ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-muted-foreground hover:text-foreground'}`}
              >
                <Filter className="w-4 h-4" /> {showFilters ? 'Ocultar Filtros' : 'Filtrar'}
              </button>
              
              {showFilters && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
                      <select
                        value={filterCategory}
                        onChange={(e) => { setFilterCategory(e.target.value); setPage(0); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary/50"
                      >
                          <option value="" className="bg-zinc-900">Todas las Categorías</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>)}
                      </select>
                      <select
                        value={filterAccount}
                        onChange={(e) => { setFilterAccount(e.target.value); setPage(0); }}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary/50"
                      >
                          <option value="" className="bg-zinc-900">Todas las Cuentas</option>
                          {accounts.map(acc => <option key={acc.id} value={acc.id} className="bg-zinc-900">{acc.nombre}</option>)}
                      </select>
                      {(filterCategory || filterAccount || searchTerm) && (
                          <button onClick={() => { setFilterCategory(''); setFilterAccount(''); setSearchTerm(''); setPage(0); }} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all" title="Limpiar Filtros">
                              <X className="w-5 h-5" />
                          </button>
                      )}
                  </motion.div>
              )}
          </div>

          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors bg-white/5 px-6 py-3 rounded-xl border border-white/5"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nuevo Movimiento"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
            <input 
              required
              value={newTx.descripcion}
              onChange={(e) => setNewTx({...newTx, descripcion: e.target.value})}
              placeholder="Ej: Suscripción Netflix, Pago Almuerzo..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto</label>
                <input 
                  type="number"
                  required
                  value={newTx.monto}
                  onChange={(e) => setNewTx({...newTx, monto: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                <select 
                    value={newTx.tipo}
                    onChange={(e) => setNewTx({...newTx, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="GASTO" className="bg-zinc-900">Gasto</option>
                    <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                </select>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Cuenta de Origen</label>
                <select 
                    required
                    value={newTx.accountId}
                    onChange={(e) => setNewTx({...newTx, accountId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="" disabled className="bg-zinc-900">Seleccionar...</option>
                    {accounts.map(acc => (
                        <option key={acc.id} value={acc.id} className="bg-zinc-900">{acc.nombre}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                <select 
                    required
                    value={newTx.categoryId}
                    onChange={(e) => setNewTx({...newTx, categoryId: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="" disabled className="bg-zinc-900">Seleccionar...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>
                    ))}
                </select>
              </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            Registrar Movimiento
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Transacción">
        {editTx && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                        <select value={editTx.tipo} onChange={(e) => setEditTx({...editTx, tipo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold">
                            <option value="GASTO" className="bg-zinc-900">Gasto</option>
                            <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto</label>
                        <input required type="number" value={editTx.monto} onChange={(e) => setEditTx({...editTx, monto: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
                    <input required value={editTx.descripcion} onChange={(e) => setEditTx({...editTx, descripcion: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                    <select required value={editTx.categoryId} onChange={(e) => setEditTx({...editTx, categoryId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold">
                        {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>)}
                    </select>
                </div>
                <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black mt-4">Guardar Cambios</button>
            </form>
        )}
      </Modal>

      <section className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xl font-bold flex items-center gap-3"><Clock className="w-6 h-6 text-primary" /> Recientes</h3>
        </div>

        <div className="divide-y divide-white/5">
          {filteredTransactions.map((tx) => (
            <TransactionRow 
              key={tx.id} 
              transaction={tx} 
              onDelete={() => handleDelete(tx.id)}
              onEdit={() => { setEditTx(tx); setIsEditModalOpen(true); }}
            />
          ))}
          {filteredTransactions.length === 0 && (
             <div className="py-32 text-center">
                 <p className="text-muted-foreground font-medium">No se encontraron movimientos con los filtros actuales.</p>
             </div>
          )}
        </div>

        <div className="flex items-center justify-between px-8 py-5 border-t border-white/5 bg-white/[0.02]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-xs font-bold text-muted-foreground">
            Página {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={transactions.length < PAGE_SIZE}
            className="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-white/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </section>
    </div>
  );
}

function TransactionRow({ transaction, onDelete, onEdit }: any) {
  const [showActions, setShowActions] = useState(false);
  const isPositive = transaction.tipo === 'INGRESO';
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="flex flex-col md:flex-row items-center justify-between p-8 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-center gap-6 flex-1 w-full md:w-auto mb-4 md:mb-0">
        <div className={`p-4 rounded-[20px] ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 rotate-90 shadow-inner'}`}>
          <ArrowUpRight className="w-6 h-6 transition-transform group-hover:scale-110" />
        </div>
        <div>
          <p className="text-lg font-black group-hover:text-primary transition-colors">{transaction.descripcion}</p>
          <div className="flex items-center gap-3 mt-1">
             <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/5 text-muted-foreground">
                {transaction.category?.nombre || 'General'}
             </span>
             <span className="text-xs text-muted-foreground/60 font-medium">{new Date(transaction.fecha).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-12 w-full md:w-auto justify-between md:justify-end">
        <div className="hidden lg:block text-right px-8 border-x border-white/5">
           <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Origen</p>
           <p className="text-sm font-bold">{transaction.account?.nombre || 'Cuenta Principal'}</p>
        </div>
        <div className="text-right min-w-[120px]">
          <p className={`text-2xl font-black tracking-tight ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? '+' : '-'}${Math.abs(transaction.monto).toLocaleString()}
          </p>
          <p className="text-[10px] font-black text-muted-foreground uppercase opacity-40">Pago confirmado</p>
        </div>
        <div className="relative">
            <button onClick={() => setShowActions(!showActions)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
            </button>
            {showActions && (
                <div className="absolute right-0 top-10 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-20 w-32 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => { onEdit(); setShowActions(false); }} className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-xs font-bold">Editar</button>
                    <button onClick={() => { onDelete(); setShowActions(false); }} className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-xs font-bold text-rose-500">Eliminar</button>
                </div>
            )}
        </div>
      </div>
    </motion.div>
  );
}
