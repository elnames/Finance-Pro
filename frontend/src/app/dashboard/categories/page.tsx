'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Layers, Plus, PieChart, MoreHorizontal, Tags, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/Toast';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import { useAuth } from '@/context/AuthContext';
import { getLimits } from '@/lib/plan-limits';
import type { Category } from '@/types';

export default function CategoriesPage() {
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCat, setNewCat] = useState({ nombre: '', tipo: 'GASTO', colorHex: '#3b82f6' });
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      success('Categoría eliminada');
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category', err);
      toastError('Error al eliminar la categoría');
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
    setEditSubmitting(true);
    try {
      await api.patch(`/categories/${editCat.id}`, editCat);
      setIsEditModalOpen(false);
      success('Categoría actualizada');
      fetchCategories();
    } catch (err) {
      console.error('Error updating category', err);
      toastError('Error al actualizar la categoría');
    } finally {
      setEditSubmitting(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.data ?? []));
    } catch (err) {
      console.error('Error fetching categories', err);
      toastError('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/categories', newCat);
      setIsModalOpen(false);
      setNewCat({ nombre: '', tipo: 'GASTO', colorHex: '#3b82f6' });
      success('Categoría creada correctamente');
      fetchCategories();
    } catch (err) {
      console.error('Error creating category', err);
      toastError('Error al crear la categoría');
    } finally {
      setSubmitting(false);
    }
  };

  const limits = getLimits(user?.plan ?? 'FREE');
  const atLimit = isFinite(limits.categories) && categories.length >= limits.categories;

  const handleNewCategory = () => {
    if (atLimit) { setUpgradeOpen(true); return; }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={user?.plan ?? 'FREE'} reason={`El plan ${user?.plan ?? 'FREE'} solo permite ${limits.categories} categorías. Sube de plan para crear más.`} />
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Categorías</h1>
          <p className="text-muted-foreground font-medium">Clasifica tus movimientos para mejores insights.</p>
          {isFinite(limits.categories) && (
            <p className="text-xs text-muted-foreground font-bold mt-1">
              <span className={atLimit ? 'text-rose-400' : 'text-primary'}>{categories.length}</span>
              <span> / {limits.categories} categorías</span>
            </p>
          )}
        </div>
        <button
          onClick={handleNewCategory}
          className={`text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl transition-all active:scale-95 ${atLimit ? 'bg-zinc-700 shadow-none' : 'bg-primary hover:bg-primary/90 shadow-primary/20'}`}
        >
          {atLimit ? <Lock className="w-5 h-5" /> : <Plus className="w-6 h-6" />}
          {atLimit ? 'Límite alcanzado' : 'Nueva Categoría'}
        </button>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Categoría"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="cat-nombre" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
            <input
              id="cat-nombre"
              required
              value={newCat.nombre}
              onChange={(e) => setNewCat({...newCat, nombre: e.target.value})}
              placeholder="Ej: Gimnasio, Inversiones..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="cat-tipo" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                <select
                    id="cat-tipo"
                    value={newCat.tipo}
                    onChange={(e) => setNewCat({...newCat, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="GASTO" className="bg-zinc-900">Gasto</option>
                    <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="cat-color" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Color</label>
                <input
                    id="cat-color"
                    type="color"
                    value={newCat.colorHex}
                    onChange={(e) => setNewCat({...newCat, colorHex: e.target.value})}
                    className="w-full h-[54px] bg-white/5 border border-white/10 rounded-2xl p-1 cursor-pointer"
                />
              </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            {submitting ? 'Guardando...' : 'Guardar Categoría'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Editar Categoría">
        {editCat && (
            <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="edit-cat-nombre" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
                    <input id="edit-cat-nombre" required value={editCat.nombre} onChange={(e) => setEditCat({...editCat, nombre: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="edit-cat-tipo" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                        <select id="edit-cat-tipo" value={editCat.tipo} onChange={(e) => setEditCat({...editCat, tipo: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold">
                            <option value="GASTO" className="bg-zinc-900">Gasto</option>
                            <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="edit-cat-color" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Color</label>
                        <input id="edit-cat-color" type="color" value={editCat.colorHex} onChange={(e) => setEditCat({...editCat, colorHex: e.target.value})} className="w-full h-[54px] bg-white/5 border border-white/10 rounded-2xl p-1" />
                    </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                category={cat}
                onDelete={() => requestDelete(cat.id)}
                onEdit={() => { setEditCat(cat); setIsEditModalOpen(true); }}
              />
            ))}
            {categories.length === 0 && (
                <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                    <Tags className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                    <p className="text-xl font-bold">No has definido categorías</p>
                </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="¿Eliminar categoría?"
        description="Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}

interface CategoryCardProps {
  category: Category;
  onDelete: () => void;
  onEdit: () => void;
}

function CategoryCard({ category, onDelete, onEdit }: CategoryCardProps) {
  const [showActions, setShowActions] = useState(false);
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-12"
          style={{ backgroundColor: `${category.colorHex}22`, color: category.colorHex, border: `1px solid ${category.colorHex}44` }}
        >
          <Layers className="w-6 h-6" />
        </div>
        <div className="relative">
            <button onClick={() => setShowActions(!showActions)} aria-label="Abrir acciones de categoría" className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal className="w-5 h-5" />
            </button>
            {showActions && (
                <div className="absolute right-0 top-10 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-20 w-32 animate-in fade-in zoom-in-95 duration-200">
                    <button onClick={() => { onEdit(); setShowActions(false); }} aria-label="Editar categoría" className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-xs font-bold">Editar</button>
                    <button onClick={() => { onDelete(); setShowActions(false); }} aria-label="Eliminar categoría" className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-xs font-bold text-rose-500">Eliminar</button>
                </div>
            )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-black tracking-tight mb-1">{category.nombre}</h3>
        <p className={`text-[10px] font-black uppercase tracking-widest ${category.tipo === 'INGRESO' ? 'text-emerald-500' : 'text-rose-500'}`}>
            {category.tipo}
        </p>
      </div>

      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-muted-foreground">Categoría Activa</span>
         </div>
      </div>

      <div
        className="absolute bottom-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all group-hover:opacity-40"
        style={{ backgroundColor: category.colorHex }}
      />
    </motion.div>
  );
}
