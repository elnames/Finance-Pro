'use client';
import { Repeat, Plus, Bell, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RecurringPage() {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Pagos Recurrentes</h1>
          <p className="text-muted-foreground font-medium">Automatiza y monitorea tus suscripciones y gastos fijos.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-3xl flex items-center gap-3 font-black shadow-2xl shadow-primary/20 transition-all active:scale-95">
          <Plus className="w-6 h-6" />
          Nueva Suscripción
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <RecurringCard title="Netflix" amount="15.990" nextDate="25 Mar" category="Ocio" iconColor="text-rose-500" />
            <RecurringCard title="Alquiler Depto" amount="450.000" nextDate="01 Abr" category="Vivienda" iconColor="text-blue-500" />
            <RecurringCard title="Internet Fibra" amount="22.500" nextDate="10 Abr" category="Servicios" iconColor="text-emerald-500" />
        </div>

        <aside className="space-y-6">
            <div className="glass p-8 rounded-[40px] border border-white/5 bg-primary/5">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-primary" /> Próximos Vencimientos</h3>
                <div className="space-y-4">
                    <UpcomingItem title="Luz" date="En 3 días" amount="34.000" />
                    <UpcomingItem title="Spotify" date="En 5 días" amount="6.990" />
                </div>
            </div>
            
            <div className="glass p-8 rounded-[40px] border border-white/5">
                <h3 className="font-bold mb-2">Total Mensual</h3>
                <p className="text-4xl font-black tracking-tighter">$529.480</p>
                <p className="text-xs text-muted-foreground mt-2 font-medium">Gastos fijos proyectados para Abril</p>
            </div>
        </aside>
      </div>
    </div>
  );
}

function RecurringCard({ title, amount, nextDate, category, iconColor }: any) {
    return (
        <motion.div 
            whileHover={{ scale: 1.01, x: 5 }}
            className="glass p-8 rounded-[36px] border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/10 transition-all"
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 ${iconColor}`}>
                    <Repeat className="w-7 h-7" />
                </div>
                <div>
                    <h4 className="text-xl font-black tracking-tight">{title}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase">{category}</p>
                </div>
            </div>
            
            <div className="flex items-center gap-10">
                <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Próximo Pago</p>
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Calendar className="w-4 h-4 opacity-40" /> {nextDate}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase mb-1">Monto</p>
                    <p className="text-2xl font-black">${amount}</p>
                </div>
                <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all text-primary" />
            </div>
        </motion.div>
    )
}

function UpcomingItem({ title, date, amount }: any) {
    return (
        <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{date}</p>
            </div>
            <p className="font-black text-sm">${amount}</p>
        </div>
    )
}
