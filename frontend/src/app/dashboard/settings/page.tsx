'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Settings, User, Shield, Bell, Moon, Globe, ChevronRight, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
  const { user: authUser, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data);
    } catch (error) {
      console.error('Error fetching profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.patch('/users/profile', {
        nombre: profile.nombre,
        email: profile.email
      });
      setMessage('Perfil actualizado con éxito');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile', error);
      setMessage('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.')) {
      try {
        await api.delete('/users/account');
        logout();
      } catch (error) {
        console.error('Error deleting account', error);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Configuración</h1>
        <p className="text-muted-foreground font-medium">Personaliza tu experiencia en Finance pro Elite.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <aside className="space-y-2">
            <SettingsTab icon={User} label="Perfil de Usuario" active />
            <SettingsTab icon={Shield} label="Seguridad" />
            <SettingsTab icon={Bell} label="Notificaciones" />
            <SettingsTab icon={Moon} label="App & Estética" />
            <SettingsTab icon={Globe} label="Región y Moneda" />
        </aside>

        <main className="md:col-span-2 space-y-8">
            <section className="glass p-10 rounded-[40px] border border-white/5 space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-white/5">
                    <div className="w-24 h-24 rounded-3xl bg-zinc-800 border-2 border-primary overflow-hidden shadow-2xl flex items-center justify-center">
                         <User className="w-12 h-12 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-1">{profile.nombre}</h2>
                        <p className="text-muted-foreground font-medium">{profile.email}</p>
                        <div className="mt-3 flex items-center gap-2">
                             <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                                {profile.role}
                             </span>
                             <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                                {profile.plan} Plan
                             </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField 
                        label="Nombre Completo" 
                        value={profile.nombre} 
                        onChange={(val: string) => setProfile({...profile, nombre: val})} 
                    />
                    <InputField 
                        label="Correo Electrónico" 
                        value={profile.email} 
                        onChange={(val: string) => setProfile({...profile, email: val})} 
                    />
                </div>

                <div className="pt-8 flex justify-between items-center">
                    <p className={`text-sm font-bold transition-all ${message.includes('éxito') ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {message && (
                            <span className="flex items-center gap-2">
                                <Check className="w-4 h-4" /> {message}
                            </span>
                        )}
                    </p>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </section>

            <section className="glass p-10 rounded-[40px] border border-white/10 bg-rose-500/5">
                <h3 className="text-rose-500 font-black mb-4 uppercase tracking-widest text-sm">Zona de Riesgo</h3>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="font-bold text-lg">Eliminar Cuenta</p>
                        <p className="text-sm text-muted-foreground font-medium">Esta acción es irreversible y borrará todos tus datos financieros.</p>
                    </div>
                    <button 
                        onClick={handleDeleteAccount}
                        className="border border-rose-500/20 text-rose-500 px-6 py-3 rounded-xl font-bold hover:bg-rose-500/10 transition-all"
                    >
                        Eliminar
                    </button>
                </div>
            </section>
        </main>
      </div>
    </div>
  );
}

function SettingsTab({ icon: Icon, label, active }: any) {
    return (
        <div className={`
            flex items-center justify-between p-5 rounded-3xl transition-all cursor-pointer group
            ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}
        `}>
            <div className="flex items-center gap-4">
                <Icon className="w-5 h-5" />
                <span className="font-bold">{label}</span>
            </div>
            {!active && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />}
        </div>
    )
}

function InputField({ label, value, onChange }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
            <input 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
        </div>
    )
}
