'use client';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowUpRight, 
  Layers, 
  Repeat, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Resumen', href: '/dashboard' },
    { icon: Wallet, label: 'Cuentas', href: '/dashboard/accounts' },
    { icon: ArrowUpRight, label: 'Transacciones', href: '/dashboard/transactions' },
    { icon: Layers, label: 'Categorías', href: '/dashboard/categories' },
    { icon: Repeat, label: 'Recurrentes', href: '/dashboard/recurring' },
    { icon: Target, label: 'Presupuestos', href: '/dashboard/budgets' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ icon: Shield, label: 'Admin', href: '/dashboard/admin' });
  }

  if (loading || (!user && pathname !== '/login')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] opacity-30" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`relative z-20 border-r border-white/5 bg-[#0a0a0a]/80 backdrop-blur-3xl hidden lg:flex flex-col flex-shrink-0 transition-all duration-300`}
        style={{ width: isSidebarOpen ? 280 : 100 }}
      >
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-white/5 border border-white/5">
            <Wallet className="text-white w-7 h-7" />
          </div>
          <div
            className={`flex flex-col transition-all duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}`}
          >
            <span className="font-black text-xl tracking-tighter uppercase italic">Finance pro</span>
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">
              {user?.isDemo ? 'Demo Mode' : user?.plan === 'ELITE' ? 'Elite Tier' : 'Pro Tier'}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-3">
          {menuItems.map((item) => (
            <Link key={item.label} href={item.href}>
              <div className={`
                flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all group relative border border-transparent
                ${pathname === item.href ? 'bg-primary text-white border-white/10 shadow-xl shadow-white/5' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'}
              `}>
                <item.icon className={`w-6 h-6 flex-shrink-0 ${pathname === item.href ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span
                  className={`
                    font-bold text-sm tracking-tight whitespace-nowrap transition-all duration-300
                    ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 pointer-events-none'}
                  `}
                >
                  {item.label}
                </span>
                {pathname === item.href && (
                  <motion.div layoutId="active-pill" className="absolute left-[-4px] w-1.5 h-6 bg-white rounded-full" />
                )}
              </div>
            </Link>
          ))}
        </nav>

        {/* User Dock Section */}
        <div className="p-4 mt-auto">
          <div className="relative">
            <AnimatePresence>
                {isUserMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full left-0 w-full mb-4 glass border border-white/10 p-3 rounded-3xl shadow-2xl z-50 overflow-hidden"
                    >
                        <Link href="/dashboard/settings" onClick={() => setIsUserMenuOpen(false)}>
                            <button className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-2xl text-sm font-bold transition-all flex items-center gap-3">
                                <Settings className="w-4 h-4" /> Configuración
                            </button>
                        </Link>
                        <button 
                            onClick={logout}
                            className="w-full text-left px-4 py-3 hover:bg-rose-500/10 rounded-2xl text-sm font-bold text-rose-500 transition-all flex items-center gap-3"
                        >
                            <LogOut className="w-4 h-4" /> Cerrar Sesión
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`
                    w-full flex items-center gap-3 p-3 rounded-[28px] transition-all border flex-shrink-0
                    ${isUserMenuOpen ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/5 hover:border-white/10'}
                `}
            >
                <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-white/10 overflow-hidden flex-shrink-0">
                    <img 
                      src={`https://ui-avatars.com/api/?name=${user?.nombre || 'User'}&background=333&color=fff`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                </div>
                <div 
                  className={`
                    flex-1 text-left overflow-hidden transition-all duration-300
                    ${isSidebarOpen ? 'opacity-100 max-w-full' : 'opacity-0 max-w-0 pointer-events-none'}
                  `}
                >
                    <p className="text-sm font-black truncate text-zinc-100">{user?.nombre || 'Inversionista'}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${user?.isDemo ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {user?.isDemo ? 'Versión Demo' : `${user?.plan || 'Free'} Account`}
                    </p>
                </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Demo Exit Button */}
        {user?.isDemo && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => logout()}
            className="fixed top-8 right-10 z-[60] bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 text-sm font-black hover:bg-zinc-800 transition-all shadow-2xl hover:scale-105 active:scale-95 group shadow-primary/5"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <LogOut className="w-4 h-4 text-primary" />
            </div>
            <span className="text-zinc-100">Salir de Demo</span>
          </motion.button>
        )}

        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-white/5 flex justify-between items-center bg-background/50 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center border border-white/10 shadow-lg">
              <Wallet className="text-white w-5 h-5" />
            </div>
            <span className="font-bold tracking-tighter uppercase italic text-sm">Finance pro</span>
          </div>
          <div className="flex items-center gap-2">
            {!user?.isDemo && (
              <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                <img src={`https://ui-avatars.com/api/?name=${user?.nombre || 'U'}&background=333&color=fff`} alt="avatar" className="w-full h-full object-cover" />
              </button>
            )}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg border border-white/10">
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
