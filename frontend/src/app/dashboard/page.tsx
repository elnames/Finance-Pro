'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { accountsApi, transactionsApi, categoriesApi, budgetsApi } from '@/services/api';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Plus,
  Target,
  Clock,
  ChevronRight,
  Rocket,
  Zap,
  PlusCircle,
  Check,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import type { Account, Transaction, Category, Budget } from '@/types';

// Lazy-load the heavy Recharts chart sections to keep the initial bundle small.
const WeeklyActivityChart = dynamic(
  () => import('@/components/dashboard/WeeklyActivityChart'),
  {
    loading: () => <div className="h-[350px] w-full animate-pulse bg-white/5 rounded-3xl" />,
    ssr: false,
  }
);

const CategoryDistributionChart = dynamic(
  () => import('@/components/dashboard/CategoryDistributionChart'),
  {
    loading: () => <div className="h-[250px] w-full animate-pulse bg-white/5 rounded-3xl" />,
    ssr: false,
  }
);

interface DashboardData {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData>({
    accounts: [],
    transactions: [],
    categories: [],
    budgets: []
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { user } = useAuth();
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return sessionStorage.getItem('fp_upgrade_banner') === 'dismissed';
  });
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const showBanner = !bannerDismissed && (user?.plan === 'FREE' || user?.plan === 'PREMIUM') && !user?.isDemo;

  const dismissBanner = () => {
    sessionStorage.setItem('fp_upgrade_banner', 'dismissed');
    setBannerDismissed(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetchError(null);
      try {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const [accs, txs, cats, buds] = await Promise.all([
          accountsApi.getAll(),
          transactionsApi.getAll(),
          categoriesApi.getAll(),
          budgetsApi.getAll(currentMonth, currentYear)
        ]);
        const pick = (r: any) => Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
        setData({
          accounts: pick(accs),
          transactions: pick(txs),
          categories: pick(cats),
          budgets: pick(buds),
        });
      } catch (error) {
        console.error('Error fetching dashboard data', error);
        setFetchError('No se pudo cargar el resumen. Verifica tu conexión e intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // monto and saldoActual are Decimal strings from the API — convert before arithmetic.
  const totalBalance = data.accounts.reduce(
    (sum: number, acc: any) => sum + Number(acc.saldoActual),
    0
  );

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = data.transactions.filter((tx: any) => {
    const d = new Date(tx.fecha);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const ingresosMes = monthlyTransactions
    .filter((tx: any) => tx.tipo === 'INGRESO')
    .reduce((sum: number, tx: any) => sum + Number(tx.monto), 0);

  const gastosMes = monthlyTransactions
    .filter((tx: any) => tx.tipo === 'GASTO')
    .reduce((sum: number, tx: any) => sum + Number(tx.monto), 0);

  // Category distribution should reflect the current month only, to be
  // consistent with the income/expense stats shown above the chart.
  const categoryTotals = monthlyTransactions.reduce((acc: any, tx: any) => {
    const catName = tx.category?.nombre || 'General';
    if (!acc[catName]) acc[catName] = { value: 0, color: tx.category?.colorHex || '#444' };
    acc[catName].value += Number(tx.monto);
    return acc;
  }, {});

  const chartData = Object.keys(categoryTotals).length > 0
    ? Object.entries(categoryTotals).map(([name, info]: any) => ({ name, value: info.value, color: info.color }))
    : [{ name: 'Sin datos', value: 1, color: '#222' }];

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split('T')[0],
      dayName: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'][d.getDay()],
      ingresos: 0,
      gastos: 0
    };
  });

  data.transactions.forEach((tx: any) => {
    const txDate = new Date(tx.fecha).toISOString().split('T')[0];
    const day = last7Days.find(d => d.date === txDate);
    if (day) {
      if (tx.tipo === 'INGRESO') day.ingresos += Number(tx.monto);
      else day.gastos += Number(tx.monto);
    }
  });

  const areaData = last7Days.map(d => ({ name: d.dayName, ingresos: d.ingresos, gastos: d.gastos }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      <p className="text-muted-foreground animate-pulse font-medium">Sincronizando tus finanzas...</p>
    </div>
  );

  if (fetchError) return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4 text-center">
      <AlertCircle className="w-12 h-12 text-rose-500" />
      <p className="text-lg font-bold text-rose-500">{fetchError}</p>
    </div>
  );

  const hasNoData = data.accounts.length === 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Upgrade Banner */}
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`relative flex items-center justify-between gap-4 px-6 py-4 rounded-3xl border ${
            user?.plan === 'FREE'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-violet-500/10 border-violet-500/20 text-violet-300'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-xl ${user?.plan === 'FREE' ? 'bg-amber-500/20' : 'bg-violet-500/20'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black text-sm">
                {user?.plan === 'FREE'
                  ? 'Estás en el plan gratuito — desbloquea todo con Premium'
                  : 'Sube a Elite y accede a funciones ilimitadas sin restricciones'}
              </p>
              <p className="text-xs opacity-70 font-medium mt-0.5">
                {user?.plan === 'FREE' ? 'Cuentas, transacciones y categorías ilimitadas.' : 'Prioridad de soporte y acceso anticipado a nuevas funciones.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setUpgradeOpen(true)}
              className={`text-xs font-black px-5 py-2.5 rounded-2xl transition-all active:scale-95 ${
                user?.plan === 'FREE'
                  ? 'bg-amber-500 hover:bg-amber-400 text-black'
                  : 'bg-violet-500 hover:bg-violet-400 text-white'
              }`}
            >
              {user?.plan === 'FREE' ? 'Subir a Premium' : 'Subir a Elite'}
            </button>
            <button onClick={dismissBanner} className="p-1.5 opacity-60 hover:opacity-100 transition-opacity rounded-lg hover:bg-white/10">
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={user?.plan ?? 'FREE'} />

      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">Hola, {user?.nombre || 'Inversionista'} 👋</h1>
          <p className="text-muted-foreground font-medium">Aquí tienes el resumen de tu patrimonio hoy.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/dashboard/transactions')}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold shadow-xl shadow-white/5 border border-white/5 transition-all active:scale-95">
            <Plus className="w-5 h-5 shadow-sm" />
            Nueva Transacción
          </button>
        </div>
      </header>

      {hasNoData ? (
        <div className="space-y-10">
          {/* Onboarding Hero */}
          <section className="glass p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 max-w-2xl">
              <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-8 border border-primary/30 shadow-lg shadow-primary/10">
                <Rocket className="w-8 h-8" />
              </div>
              <h2 className="text-5xl font-black mb-4 tracking-tighter italic">Comienza tu viaje hacia la libertad financiera.</h2>
              <p className="text-xl text-muted-foreground font-medium mb-10 leading-relaxed">
                 Finance Pro está listo para ayudarte a dominar tu capital. Sigue estos pasos para activar tu panel de control personalizado.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <OnboardingStep 
                  number="1"
                  title="Crea una Cuenta"
                  description="Añade tu banco o billetera."
                  icon={Wallet}
                  completed={false}
                />
                <OnboardingStep 
                  number="2"
                  title="Define Categorías"
                  description="Personaliza tus gastos."
                  icon={Zap}
                  completed={data.categories.length > 0}
                />
                <OnboardingStep 
                  number="3"
                  title="Primer Movimiento"
                  description="Registra un ingreso o gasto."
                  icon={ArrowUpRight}
                  completed={false}
                />
              </div>
            </div>
          </section>

          {/* Quick Start Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-8 rounded-[32px] border border-white/5 flex items-center gap-6 group hover:border-primary/30 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-black group-hover:text-primary transition-colors">Vincular mi primer activo</h4>
                <p className="text-sm text-muted-foreground font-medium italic underline decoration-primary/30 underline-offset-4">Configuración de cuentas ↗</p>
              </div>
            </div>
            <div className="glass p-8 rounded-[32px] border border-white/5 flex items-center gap-6 group hover:border-emerald-500/30 transition-all cursor-pointer">
              <div className="w-14 h-14 bg-secondary rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                <ArrowUpRight className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-lg font-black group-hover:text-emerald-500 transition-colors">Registrar saldo inicial</h4>
                <p className="text-sm text-muted-foreground font-medium italic underline decoration-emerald-500/30 underline-offset-4">Nueva transacción ↗</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              icon={Wallet} 
              label="Saldo Total" 
              value={`$${totalBalance.toLocaleString()}`} 
              trend="+2.5%" 
              positive={true} 
              description="Capital disponible"
            />
            <StatCard 
              icon={TrendingUp} 
              label="Ingresos Mes" 
              value={`$${ingresosMes.toLocaleString()}`} 
              trend={`${monthlyTransactions.filter((t:any)=>t.tipo==='INGRESO').length} TX`} 
              positive={true} 
              color="text-emerald-500"
              description="Flujo de entrada"
            />
            <StatCard 
              icon={TrendingDown} 
              label="Gastos Mes" 
              value={`$${gastosMes.toLocaleString()}`} 
              trend={`${monthlyTransactions.filter((t:any)=>t.tipo==='GASTO').length} TX`} 
              positive={false} 
              color="text-rose-500"
              description="Flujo de salida"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Main Chart Card — lazy loaded */}
            <section className="lg:col-span-4 glass p-8 rounded-[32px] border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">Actividad Semanal</h3>
                <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-primary" /> Ingresos</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500" /> Gastos</div>
                </div>
              </div>
              <WeeklyActivityChart data={areaData} />
            </section>

            {/* Categories Pie Card — lazy loaded */}
            <section className="lg:col-span-3 glass p-8 rounded-[32px] border border-white/5 flex flex-col items-center">
              <h3 className="text-xl font-bold mb-6 self-start">Distribución</h3>
              <CategoryDistributionChart data={chartData} />
            </section>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <section className="glass p-8 rounded-[32px] border border-white/5">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Últimos Movimientos
                </h3>
                <Link href="/dashboard/transactions" className="text-primary text-sm hover:underline font-bold flex items-center gap-1">
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-4">
                {data.transactions.length > 0 ? (
                  data.transactions.slice(0, 5).map((tx: any) => (
                    <TransactionItem key={tx.id} transaction={tx} />
                  ))
                ) : (
                  <>
                    <SampleTransactionItem label="Netflix Premium" category="Ocio" amount="-15.990" date="Hace 2h" />
                    <SampleTransactionItem label="Sueldo Quincena" category="Trabajo" amount="+1.250.000" date="Ayer" positive />
                    <SampleTransactionItem label="Starbucks" category="Comida" amount="-4.500" date="Ayer" />
                  </>
                )}
              </div>
            </section>

            {/* Goals / Presupuestos */}
            <section className="glass p-8 rounded-[32px] border border-white/5">
                <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Presupuestos del Mes
                </h3>
                <Link href="/dashboard/budgets" className="text-primary text-xs hover:underline font-bold">Configurar Meta</Link>
              </div>
              <div className="space-y-6">
                {data.budgets.length > 0 ? (
                  data.budgets.slice(0, 3).map((bud: any) => {
                    const budgetMonto = Number(bud.monto);
                    // Use monthlyTransactions (already filtered by month AND year)
                    // to avoid including same-month transactions from prior years.
                    const spent = monthlyTransactions
                      .filter((tx: any) =>
                        tx.categoryId === bud.categoryId &&
                        tx.tipo === 'GASTO'
                      )
                      .reduce((acc: number, curr: any) => acc + Number(curr.monto), 0);

                    return (
                      <GoalProgress
                        key={bud.id}
                        title={bud.category.nombre}
                        target={budgetMonto}
                        current={spent}
                        color={spent > budgetMonto ? 'bg-rose-500' : 'bg-primary'}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-6 opacity-40">
                    <p className="text-sm font-bold">No hay presupuestos activos</p>
                    <p className="text-[10px] uppercase">Empieza a controlar tus gastos hoy.</p>
                  </div>
                )}
                
                <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 mt-4">
                  <p className="text-sm font-bold text-primary mb-2 italic underline underline-offset-4">Insight de Finanzas Pro 🔮</p>
                  <p className="text-sm leading-relaxed text-muted-foreground font-medium">
                    {data.budgets.length > 0 
                      ? "Mantén tus gastos bajo control para alcanzar tus metas de ahorro este mes."
                      : "Define tu primer presupuesto para recibir consejos personalizados de ahorro."}
                  </p>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function OnboardingStep({ number, title, description, icon: Icon, completed }: any) {
  return (
    <div className={`p-6 rounded-3xl border transition-all ${completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${completed ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
          {completed ? <Check className="w-4 h-4" /> : number}
        </div>
        <Icon className={`w-6 h-6 ${completed ? 'text-emerald-500' : 'text-muted-foreground'}`} />
      </div>
      <h4 className="text-sm font-black mb-1">{title}</h4>
      <p className="text-[10px] text-muted-foreground font-bold leading-tight tracking-wide">{description}</p>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, positive, color, description }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl translate-x-8 -translate-y-8 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl bg-secondary/80 border border-white/5 ${color} shadow-inner`}>
          <Icon className="w-7 h-7" />
        </div>
        <div className={`text-xs font-black px-3 py-1.5 rounded-xl ${positive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-muted-foreground mb-1">{label}</p>
        <h2 className="text-3xl font-black tracking-tight">{value}</h2>
        <p className="text-[10px] font-bold text-muted-foreground/60 mt-2 uppercase tracking-widest">{description}</p>
      </div>
    </motion.div>
  );
}

function TransactionItem({ transaction }: any) {
  const isPositive = transaction.tipo === 'INGRESO';
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 rotate-90'}`}>
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div>
          <p className="text-base font-bold group-hover:text-primary transition-colors">{transaction.descripcion}</p>
          <p className="text-xs font-semibold text-muted-foreground">{transaction.category?.nombre || 'General'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-base font-black ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isPositive ? '+' : '-'}${Math.abs(Number(transaction.monto)).toLocaleString()}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(transaction.fecha).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function SampleTransactionItem({ label, category, amount, date, positive }: any) {
  return (
    <div className="flex items-center justify-between p-4 rounded-3xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all group cursor-pointer">
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl ${positive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 rotate-90'}`}>
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div>
          <p className="text-base font-bold group-hover:text-primary transition-colors">{label}</p>
          <p className="text-xs font-semibold text-muted-foreground">{category}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-base font-black ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
          {amount}
        </p>
        <p className="text-[10px] font-bold text-muted-foreground uppercase">{date}</p>
      </div>
    </div>
  );
}

function GoalProgress({ title, target, current, color }: any) {
  // Guard against division by zero when target is 0
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs text-muted-foreground font-medium">${current.toLocaleString()} de ${target.toLocaleString()}</p>
        </div>
        <span className="text-xs font-black">{percentage.toFixed(0)}%</span>
      </div>
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden border border-white/5 p-[1px]">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full shadow-[0_0_15px_rgba(59,130,246,0.3)] ${color}`}
        />
      </div>
    </div>
  );
}
