'use client';
import { useEffect, useMemo, useState } from 'react';
import api from '@/services/api';
import { ArrowUpRight, Search, Filter, Plus, Clock, MoreVertical, Download, X, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Transaction, Account, Category } from '@/types';

export default function TransactionsPage() {
  const { success, error: toastError } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTx, setNewTx] = useState({
    monto: '',
    tipo: 'GASTO',
    descripcion: '',
    accountId: '',
    categoryId: ''
  });
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Inline quick-create states for account and category
  const [quickAccMode, setQuickAccMode] = useState(false);
  const [quickAccName, setQuickAccName] = useState('');
  const [quickAccSaldo, setQuickAccSaldo] = useState('');
  const [quickCatMode, setQuickCatMode] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [quickCreating, setQuickCreating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccount, setFilterAccount] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async () => {
    try {
      const [txRes, accRes, catRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/accounts'),
        api.get('/categories')
      ]);
      // Paginated endpoints return { data: [...], total, page, limit, totalPages }
      setTransactions(Array.isArray(txRes.data) ? txRes.data : (txRes.data?.data ?? []));
      setAccounts(Array.isArray(accRes.data) ? accRes.data : (accRes.data?.data ?? []));
      setCategories(Array.isArray(catRes.data) ? catRes.data : (catRes.data?.data ?? []));
    } catch (err) {
      console.error('Error fetching transactions', err);
      toastError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMonto = Number(newTx.monto);
    if (!parsedMonto || parsedMonto <= 0 || isNaN(parsedMonto)) {
      toastError('El monto debe ser un número mayor que cero');
      return;
    }
    if (!newTx.accountId) { toastError('Selecciona o crea una cuenta de origen'); return; }
    if (!newTx.categoryId) { toastError('Selecciona o crea una categoría'); return; }
    setSubmitting(true);
    try {
      await api.post('/transactions', {
        ...newTx,
        monto: parsedMonto,
        accountId: Number(newTx.accountId),
        categoryId: Number(newTx.categoryId)
      });
      resetNewTxModal();
      success('Movimiento registrado correctamente');
      fetchData();
    } catch (err) {
      console.error('Error creating transaction', err);
      toastError('Error al registrar el movimiento');
    } finally {
      setSubmitting(false);
    }
  };

  const resetNewTxModal = () => {
    setIsModalOpen(false);
    setNewTx({ monto: '', tipo: 'GASTO', descripcion: '', accountId: '', categoryId: '' });
    setQuickAccMode(false); setQuickAccName(''); setQuickAccSaldo('');
    setQuickCatMode(false); setQuickCatName('');
  };

  const handleQuickCreateAccount = async () => {
    if (!quickAccName.trim()) return;
    setQuickCreating(true);
    try {
      const res = await api.post('/accounts', { nombre: quickAccName.trim(), saldoActual: Number(quickAccSaldo) || 0 });
      await fetchData();
      setNewTx(prev => ({ ...prev, accountId: String(res.data.id) }));
      setQuickAccMode(false); setQuickAccName(''); setQuickAccSaldo('');
      success('Cuenta creada');
    } catch {
      toastError('Error al crear la cuenta');
    } finally {
      setQuickCreating(false);
    }
  };

  const handleQuickCreateCategory = async () => {
    if (!quickCatName.trim()) return;
    setQuickCreating(true);
    try {
      const res = await api.post('/categories', { nombre: quickCatName.trim(), tipo: newTx.tipo === 'INGRESO' ? 'INGRESO' : 'GASTO' });
      await fetchData();
      setNewTx(prev => ({ ...prev, categoryId: String(res.data.id) }));
      setQuickCatMode(false); setQuickCatName('');
      success('Categoría creada');
    } catch {
      toastError('Error al crear la categoría');
    } finally {
      setQuickCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`);
      success('Transacción eliminada');
      fetchData();
    } catch (err) {
      console.error('Error deleting transaction', err);
      toastError('Error al eliminar la transacción');
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
    const parsedMonto = Number(editTx.monto);
    if (!parsedMonto || parsedMonto <= 0 || isNaN(parsedMonto)) {
      toastError('El monto debe ser un número mayor que cero');
      return;
    }
    setEditSubmitting(true);
    try {
      await api.patch(`/transactions/${editTx.id}`, {
        descripcion: editTx.descripcion,
        monto: parsedMonto,
        tipo: editTx.tipo,
        categoryId: Number(editTx.categoryId)
      });
      setIsEditModalOpen(false);
      success('Transacción actualizada');
      fetchData();
    } catch (err) {
      console.error('Error updating transaction', err);
      toastError('Error al actualizar la transacción');
    } finally {
      setEditSubmitting(false);
    }
  };

  const escapeCSVField = (value: string | number): string => {
    const str = String(value);
    const sanitized = /^[=+\-@]/.test(str) ? `'${str}` : str;
    return `"${sanitized.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const headers = ['Fecha', 'Descripción', 'Tipo', 'Monto', 'Categoría', 'Cuenta'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.fecha).toLocaleDateString(),
      tx.descripcion,
      tx.tipo,
      tx.monto,
      tx.category?.nombre || 'General',
      tx.account?.nombre || 'N/A'
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(escapeCSVField).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    success('CSV exportado correctamente');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Guard: descripcion may be null/undefined on older records
      const matchesSearch = (tx.descripcion ?? '').toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCategory = filterCategory ? tx.categoryId === Number(filterCategory) : true;
      const matchesAccount = filterAccount ? tx.accountId === Number(filterAccount) : true;
      return matchesSearch && matchesCategory && matchesAccount;
    });
  }, [transactions, debouncedSearch, filterCategory, filterAccount]);

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
              onChange={(e) => setSearchTerm(e.target.value)}
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
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary/50"
                      >
                          <option value="" className="bg-zinc-900">Todas las Categorías</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>)}
                      </select>
                      <select
                        value={filterAccount}
                        onChange={(e) => setFilterAccount(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-primary/50"
                      >
                          <option value="" className="bg-zinc-900">Todas las Cuentas</option>
                          {accounts.map(acc => <option key={acc.id} value={acc.id} className="bg-zinc-900">{acc.nombre}</option>)}
                      </select>
                      {(filterCategory || filterAccount || searchTerm) && (
                          <button onClick={() => { setFilterCategory(''); setFilterAccount(''); setSearchTerm(''); }} className="p-2 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-all" title="Limpiar Filtros">
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
        onClose={resetNewTxModal}
        title="Nuevo Movimiento"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="tx-descripcion" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
            <input
              id="tx-descripcion"
              required
              value={newTx.descripcion}
              onChange={(e) => setNewTx({...newTx, descripcion: e.target.value})}
              placeholder="Ej: Suscripción Netflix, Pago Almuerzo..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="tx-monto" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto</label>
                <input
                  id="tx-monto"
                  type="number"
                  required
                  value={newTx.monto}
                  onChange={(e) => setNewTx({...newTx, monto: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="tx-tipo" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                <select
                    id="tx-tipo"
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
                {quickAccMode ? (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      placeholder="Nombre de cuenta"
                      value={quickAccName}
                      onChange={e => setQuickAccName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleQuickCreateAccount())}
                      className="w-full bg-white/5 border border-primary/40 rounded-2xl p-3 text-sm font-bold focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Saldo inicial (opcional)"
                      value={quickAccSaldo}
                      onChange={e => setQuickAccSaldo(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 text-sm font-bold focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button type="button" disabled={quickCreating || !quickAccName.trim()} onClick={handleQuickCreateAccount}
                        className="flex-1 bg-primary disabled:opacity-50 text-white py-2 rounded-xl text-xs font-black">
                        {quickCreating ? 'Creando...' : 'Crear cuenta'}
                      </button>
                      <button type="button" onClick={() => setQuickAccMode(false)} className="px-3 py-2 bg-white/5 rounded-xl text-xs font-bold">✕</button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newTx.accountId}
                    onChange={e => {
                      if (e.target.value === '__create__') { setQuickAccMode(true); setNewTx({...newTx, accountId: ''}); }
                      else setNewTx({...newTx, accountId: e.target.value});
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="" disabled className="bg-zinc-900">Seleccionar...</option>
                    <option value="__create__" className="bg-zinc-900 text-primary">＋ Crear nueva cuenta</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id} className="bg-zinc-900">{acc.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                {quickCatMode ? (
                  <div className="space-y-2">
                    <input
                      autoFocus
                      placeholder="Nombre de categoría"
                      value={quickCatName}
                      onChange={e => setQuickCatName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleQuickCreateCategory())}
                      className="w-full bg-white/5 border border-primary/40 rounded-2xl p-3 text-sm font-bold focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button type="button" disabled={quickCreating || !quickCatName.trim()} onClick={handleQuickCreateCategory}
                        className="flex-1 bg-primary disabled:opacity-50 text-white py-2 rounded-xl text-xs font-black">
                        {quickCreating ? 'Creando...' : 'Crear categoría'}
                      </button>
                      <button type="button" onClick={() => setQuickCatMode(false)} className="px-3 py-2 bg-white/5 rounded-xl text-xs font-bold">✕</button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={newTx.categoryId}
                    onChange={e => {
                      if (e.target.value === '__create__') { setQuickCatMode(true); setNewTx({...newTx, categoryId: ''}); }
                      else setNewTx({...newTx, categoryId: e.target.value});
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="" disabled className="bg-zinc-900">Seleccionar...</option>
                    <option value="__create__" className="bg-zinc-900 text-primary">＋ Crear nueva categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>
                    ))}
                  </select>
                )}
              </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            {submitting ? 'Registrando...' : 'Registrar Movimiento'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Transacción">
        {editTx && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="edit-tx-tipo" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                        <select id="edit-tx-tipo" value={editTx.tipo} onChange={(e) => setEditTx({...editTx, tipo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold">
                            <option value="GASTO" className="bg-zinc-900">Gasto</option>
                            <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="edit-tx-monto" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Monto</label>
                        <input id="edit-tx-monto" required type="number" value={editTx.monto} onChange={(e) => setEditTx({...editTx, monto: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label htmlFor="edit-tx-descripcion" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Descripción</label>
                    <input id="edit-tx-descripcion" required value={editTx.descripcion} onChange={(e) => setEditTx({...editTx, descripcion: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="space-y-2">
                    <label htmlFor="edit-tx-categoria" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Categoría</label>
                    <select id="edit-tx-categoria" required value={editTx.categoryId} onChange={(e) => setEditTx({...editTx, categoryId: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold">
                        {categories.map(cat => <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>)}
                    </select>
                </div>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="w-full bg-primary disabled:opacity-60 disabled:cursor-not-allowed py-4 rounded-2xl font-black mt-4"
                >
                  {editSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </form>
        )}
      </Modal>

      <section className="glass rounded-[40px] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xl font-bold flex items-center gap-3"><Clock className="w-6 h-6 text-primary" /> Recientes</h3>
        </div>

        {loading ? (
          <div className="p-8">
            <TableSkeleton rows={6} />
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredTransactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                transaction={tx}
                onDelete={() => requestDelete(tx.id)}
                onEdit={() => { setEditTx(tx); setIsEditModalOpen(true); }}
              />
            ))}
            {filteredTransactions.length === 0 && (
               <div className="py-32 text-center">
                   <p className="text-muted-foreground font-medium">No se encontraron movimientos con los filtros actuales.</p>
               </div>
            )}
          </div>
        )}
      </section>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="¿Eliminar transacción?"
        description="El saldo de la cuenta será reversado. Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

interface TransactionRowProps {
  transaction: Transaction;
  onDelete: () => void;
  onEdit: () => void;
}

function TransactionRow({ transaction, onDelete, onEdit }: TransactionRowProps) {
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
            {isPositive ? '+' : '-'}${Math.abs(Number(transaction.monto)).toLocaleString()}
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
