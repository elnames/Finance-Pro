'use client';

import { HeroGeometric, GeometricBackground, ElegantShape } from "@/components/ui/shape-landing-hero";
import { motion } from 'framer-motion';
import { 
  ArrowRight,
  Calculator,
  PieChart,
  TrendingUp,
  Wallet
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [isStartingDemo, setIsStartingDemo] = useState(false);
  const { user, loading, loginAsDemo, logout } = useAuth() as any;

  useEffect(() => {
    if (!loading && user?.isDemo && !isStartingDemo) {
      logout();
      return;
    }

    if (!loading && user && !user.isDemo) {
      router.replace('/dashboard');
    }
  }, [user, loading, router, logout, isStartingDemo]);

  const handleStart = () => {
    router.push('/register');
  };

  const handleDemo = async () => {
    setIsStartingDemo(true);
    await loginAsDemo();
  };

  return (
    <GeometricBackground>
      <div className="min-h-screen text-foreground selection:bg-primary/30 relative">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 px-6 py-8">
          <div className="max-w-7xl mx-auto flex justify-between items-center glass border border-white/5 py-3 px-8 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Wallet className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight uppercase italic">Finance pro</span>
            </div>
            
            <div className="hidden md:flex items-center gap-10">
              <Link href="#features" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Funciones</Link>
              <Link href="#security" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Seguridad</Link>
              <Link href="#pricing" className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">Precios</Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest px-4">Entrar</Link>
              <Link href="/register" className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 text-sm uppercase tracking-widest">Registrarme</Link>
            </div>
          </div>
        </nav>

        {/* Hero Geometric Section */}
        <HeroGeometric 
          onButtonClick={handleStart}
          onDemoClick={handleDemo}
          badge="Finance pro"
          title1="Tus Finanzas,"
          title2="Dominadas Sin Esfuerzo"
          description="Finance pro te empodera para gestionar, hacer crecer y asegurar tu patrimonio con seguimiento inteligente y claridad absoluta."
        />

        {/* Extra geometric shapes for scroll depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 mt-[100vh]">
           <ElegantShape
              delay={0.8}
              width={400}
              height={100}
              rotate={35}
              gradient="from-emerald-500/[0.1]"
              className="left-[-5%] top-[20%]"
          />
          <ElegantShape
              delay={1}
              width={300}
              height={80}
              rotate={-20}
              gradient="from-blue-500/[0.1]"
              className="right-[5%] top-[40%]"
          />
          <ElegantShape
              delay={1.2}
              width={500}
              height={150}
              rotate={10}
              gradient="from-indigo-500/[0.1]"
              className="left-[15%] top-[60%]"
          />
        </div>

        {/* Features Grid */}
        <section id="features" className="relative z-10 py-32 px-6 bg-transparent">
          <div className="max-w-7xl mx-auto text-center mb-24">
            <motion.span 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="text-primary font-black tracking-[0.3em] uppercase text-sm mb-4 block"
            >
              Potencial Ilimitado
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">Herramientas que te empoderan</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto font-medium">Diseñamos cada función para que gestionar tus finanzas no solo sea fácil, sino placentero.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={TrendingUp} 
              title="Seguimiento Inteligente" 
              description="Visualizaciones 360 y gráficos avanzados para una analítica industrial y expansión de activos."
              delay={0}
              buttonText="Saber Más"
            />
            <FeatureCard 
              icon={Calculator} 
              title="Metas Automatizadas" 
              description="Finance pro te ayuda a gestionar y asegurar tu riqueza mediante objetivos automatizados."
              delay={0.1}
              buttonText="Meta Automatizada"
            />
            <FeatureCard 
              icon={PieChart} 
              title="Insights Avanzados" 
              description="Reportes detallados que maximizan el marketing personal, crecimiento y opciones avanzadas."
              delay={0.2}
              buttonText="Saber Más"
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative z-10 py-32 bg-secondary/10 backdrop-blur-xl border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div>
              <h3 className="text-6xl font-black text-primary mb-2">10k+</h3>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Usuarios Activos</p>
            </div>
            <div>
              <h3 className="text-6xl font-black text-primary mb-2">$500M</h3>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Dinero Gestionado</p>
            </div>
            <div>
              <h3 className="text-6xl font-black text-primary mb-2">99.9%</h3>
              <p className="text-muted-foreground font-bold tracking-widest uppercase text-sm">Disponibilidad</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative z-10 py-48 px-6 text-center">
          <div className="relative">
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 italic">¿Listo para evolucionar?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-medium">Únete a la nueva generación de Finanzas Pro y descubre el verdadero significado de la libertad financiera.</p>
            <Link href="/register" className="inline-flex items-center gap-3 bg-white text-black font-black px-12 py-6 rounded-3xl text-xl hover:scale-105 transition-all shadow-2xl">
              Empezar Gratis <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 py-24 px-6 bg-black/40 backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Wallet className="text-white w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight uppercase">Finance pro</span>
            </div>
            <div className="flex gap-12 text-sm font-bold text-muted-foreground tracking-widest uppercase text-center">
              <Link href="#" className="hover:text-primary transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-primary transition-colors">Términos</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contacto</Link>
            </div>
            <p className="text-muted-foreground text-sm font-medium">© 2026 Finance pro. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </GeometricBackground>
  );
}
function FeatureCard({ icon: Icon, title, description, delay, buttonText }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -10 }}
      className="glass p-10 rounded-[40px] border border-white/10 hover:border-primary/40 group transition-all relative overflow-hidden bg-white/5 backdrop-blur-2xl shadow-2xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-x-8 -translate-y-8" />
      <div className="w-16 h-16 bg-white/10 rounded-[24px] flex items-center justify-center mb-8 border border-white/10 shadow-inner group-hover:bg-primary group-hover:text-white transition-all">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium mb-8 text-sm">{description}</p>
      
      <button className="flex items-center gap-2 text-sm font-black border border-white/10 px-6 py-3 rounded-2xl hover:bg-white/5 transition-all">
        {buttonText} <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
