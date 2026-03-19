'use client';
import { Settings, User, Shield, Bell, Moon, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
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
                    <div className="w-24 h-24 rounded-3xl bg-zinc-800 border-2 border-primary overflow-hidden shadow-2xl">
                         <img 
                            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" 
                            alt="avatar" 
                            className="w-full h-full object-cover"
                          />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black mb-1">Javier Jorquera</h2>
                        <p className="text-muted-foreground font-medium">javier@example.com</p>
                        <button className="text-primary text-xs font-black uppercase tracking-widest mt-3 hover:underline">Cambiar foto de perfil</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Nombre Completo" value="Javier Jorquera" />
                    <InputField label="Nombre de Usuario" value="@jjorquera" />
                    <InputField label="Correo Electrónico" value="javier@example.com" />
                    <InputField label="País" value="Chile 🇨🇱" />
                </div>

                <div className="pt-8 flex justify-end">
                    <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all active:scale-95">
                        Guardar Cambios
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
                    <button className="border border-rose-500/20 text-rose-500 px-6 py-3 rounded-xl font-bold hover:bg-rose-500/10 transition-all">
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

function InputField({ label, value }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
            <input 
                defaultValue={value}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all shadow-inner"
            />
        </div>
    )
}
