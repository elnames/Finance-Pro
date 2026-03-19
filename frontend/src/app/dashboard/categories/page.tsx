'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Layers, Plus, PieChart, MoreHorizontal, Tags } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ nombre: '', tipo: 'GASTO', colorHex: '#3b82f6' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/categories', newCat);
      setIsModalOpen(false);
      setNewCat({ nombre: '', tipo: 'GASTO', colorHex: '#3b82f6' });
      fetchCategories();
    } catch (error) {
      console.error('Error creating category', error);
    }
  };

  if (loading) return <div className="animate-pulse">Organizando tus etiquetas...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Categorías</h1>
          <p className="text-muted-foreground font-medium">Clasifica tus movimientos para mejores insights.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Nueva Categoría
        </button>
      </header>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nueva Categoría"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Nombre</label>
            <input 
              required
              value={newCat.nombre}
              onChange={(e) => setNewCat({...newCat, nombre: e.target.value})}
              placeholder="Ej: Gimnasio, Inversiones..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Tipo</label>
                <select 
                    value={newCat.tipo}
                    onChange={(e) => setNewCat({...newCat, tipo: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all"
                >
                    <option value="GASTO" className="bg-zinc-900">Gasto</option>
                    <option value="INGRESO" className="bg-zinc-900">Ingreso</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Color</label>
                <input 
                    type="color"
                    value={newCat.colorHex}
                    onChange={(e) => setNewCat({...newCat, colorHex: e.target.value})}
                    className="w-full h-[54px] bg-white/5 border border-white/10 rounded-2xl p-1 cursor-pointer"
                />
              </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/30 transition-all active:scale-95 mt-4"
          >
            Guardar Categoría
          </button>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
        {categories.length === 0 && (
            <div className="col-span-full py-20 text-center glass rounded-[40px] border border-dashed border-white/20">
                <Tags className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                <p className="text-xl font-bold">No has definido categorías</p>
            </div>
        )}
      </div>
    </div>
  );
}

function CategoryCard({ category }: any) {
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
        <button className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-5 h-5" />
        </button>
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
            <span className="text-xs font-bold text-muted-foreground">12 Items</span>
         </div>
         <span className="text-xs font-black">$450k</span>
      </div>
      
      <div 
        className="absolute bottom-0 right-0 w-24 h-24 blur-[60px] opacity-20 transition-all group-hover:opacity-40"
        style={{ backgroundColor: category.colorHex }}
      />
    </motion.div>
  );
}
