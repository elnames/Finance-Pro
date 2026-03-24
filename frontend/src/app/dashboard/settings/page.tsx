'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
import {
  User, Shield, Bell, Moon, Globe, CreditCard,
  ChevronRight, Loader2, Check, AlertCircle, Eye, EyeOff,
  Sparkles, Crown, Zap
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { UpgradeModal } from '@/components/ui/UpgradeModal';
import type { User as UserType, Payment } from '@/types';

type Tab = 'perfil' | 'seguridad' | 'notificaciones' | 'apariencia' | 'region' | 'facturacion';

const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'perfil',        icon: User,       label: 'Perfil de Usuario' },
  { id: 'seguridad',     icon: Shield,     label: 'Seguridad' },
  { id: 'notificaciones',icon: Bell,       label: 'Notificaciones' },
  { id: 'apariencia',    icon: Moon,       label: 'App & Estética' },
  { id: 'region',        icon: Globe,      label: 'Región y Moneda' },
  { id: 'facturacion',   icon: CreditCard, label: 'Facturación' },
];

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  FREE:    { label: 'Free',    color: 'text-zinc-300',   bg: 'bg-zinc-500/10',    border: 'border-zinc-500/20',   icon: User },
  PREMIUM: { label: 'Premium', color: 'text-amber-400',  bg: 'bg-amber-500/10',   border: 'border-amber-500/20',  icon: Sparkles },
  ELITE:   { label: 'Elite',   color: 'text-violet-300', bg: 'bg-violet-500/10',  border: 'border-violet-500/20', icon: Crown },
  ADMIN:   { label: 'Admin',   color: 'text-indigo-300', bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20', icon: Zap },
};

function useLocalPref<T>(key: string, defaultVal: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultVal;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultVal;
    try { return JSON.parse(stored) as T; } catch { return defaultVal; }
  });
  const set = (v: T) => { localStorage.setItem(key, JSON.stringify(v)); setVal(v); };
  return [val, set];
}

export default function SettingsPage() {
  const { user: authUser, logout } = useAuth();
  const { success, error: toastError } = useToast();
  const [tab, setTab] = useState<Tab>('perfil');

  const [profile, setProfile] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(r => setProfile(r.data as UserType)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>;
  if (!profile) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
      <AlertCircle className="w-10 h-10 text-rose-500" />
      <p className="text-muted-foreground font-medium">No se pudo cargar el perfil.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black tracking-tight mb-2">Configuración</h1>
        <p className="text-muted-foreground font-medium">Gestiona tu cuenta, seguridad y preferencias.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="space-y-1.5">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                tab === t.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-white/5 text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <t.icon className="w-4 h-4" />
                <span className="font-bold text-sm">{t.label}</span>
              </div>
              {tab !== t.id && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />}
            </button>
          ))}
        </aside>

        {/* Content */}
        <div className="md:col-span-2">
          {tab === 'perfil'         && <PerfilTab profile={profile} setProfile={setProfile} success={success} toastError={toastError} />}
          {tab === 'seguridad'      && <SeguridadTab success={success} toastError={toastError} logout={logout} />}
          {tab === 'notificaciones' && <NotificacionesTab />}
          {tab === 'apariencia'     && <AparienciaTab />}
          {tab === 'region'         && <RegionTab />}
          {tab === 'facturacion'    && <FacturacionTab profile={profile} onUpgrade={() => setUpgradeOpen(true)} />}
        </div>
      </div>

      <UpgradeModal isOpen={upgradeOpen} onClose={() => setUpgradeOpen(false)} currentPlan={authUser?.plan ?? 'FREE'} />
    </div>
  );
}

/* ─────────────── PERFIL ─────────────── */
function PerfilTab({ profile, setProfile, success, toastError }: any) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [isErr, setIsErr] = useState(false);

  const save = async () => {
    if (!profile.nombre.trim()) { setMsg('El nombre no puede estar vacío'); setIsErr(true); return; }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim());
    if (!emailOk) { setMsg('Email inválido'); setIsErr(true); return; }
    setSaving(true); setMsg('');
    try {
      await api.patch('/users/profile', { nombre: profile.nombre, email: profile.email });
      setMsg('Guardado'); setIsErr(false); setTimeout(() => setMsg(''), 3000);
      success('Perfil actualizado');
    } catch { setMsg('Error al guardar'); setIsErr(true); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <section className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <div className="flex items-center gap-5 pb-6 border-b border-white/5">
          <div className="w-20 h-20 rounded-3xl bg-zinc-800 border-2 border-primary overflow-hidden flex items-center justify-center shadow-xl">
            <User className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-black">{profile.nombre}</h2>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">{profile.role}</span>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">{profile.plan}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField id="s-nombre" label="Nombre Completo" value={profile.nombre} onChange={v => setProfile({...profile, nombre: v})} />
          <InputField id="s-email" label="Correo Electrónico" type="email" value={profile.email} onChange={v => setProfile({...profile, email: v})} />
        </div>
        <div className="flex justify-between items-center pt-2">
          <p className={`text-sm font-bold ${isErr ? 'text-rose-500' : 'text-emerald-500'}`}>
            {msg && <span className="flex items-center gap-1">{isErr ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}{msg}</span>}
          </p>
          <button onClick={save} disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black disabled:opacity-50 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ─────────────── SEGURIDAD ─────────────── */
function SeguridadTab({ success, toastError, logout }: any) {
  const [current, setCurrent] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const changePassword = async () => {
    if (!current || !newPw || !confirm) { toastError('Completa todos los campos'); return; }
    if (newPw !== confirm) { toastError('Las contraseñas no coinciden'); return; }
    if (newPw.length < 6) { toastError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
    setSaving(true);
    try {
      await api.patch('/users/password', { currentPassword: current, newPassword: newPw });
      success('Contraseña actualizada correctamente');
      setCurrent(''); setNewPw(''); setConfirm('');
    } catch (e: any) {
      toastError(e?.response?.data?.message || 'Error al cambiar la contraseña');
    } finally { setSaving(false); }
  };

  const deleteAccount = async () => {
    const pw = window.prompt('Ingresa tu contraseña para confirmar la eliminación:');
    if (!pw) return;
    try {
      await api.delete('/users/account', { data: { password: pw } });
      logout();
    } catch { toastError('Contraseña incorrecta o error al eliminar la cuenta'); }
  };

  return (
    <div className="space-y-6">
      <section className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
        <h3 className="font-black text-lg">Cambiar Contraseña</h3>
        <div className="space-y-4">
          <PasswordField id="pw-current" label="Contraseña Actual" value={current} onChange={setCurrent} show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PasswordField id="pw-new" label="Nueva Contraseña" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew(v => !v)} />
            <PasswordField id="pw-confirm" label="Confirmar Nueva Contraseña" value={confirm} onChange={setConfirm} show={showNew} onToggle={() => setShowNew(v => !v)} />
          </div>
        </div>
        {newPw && (
          <div className="flex gap-2">
            {['6+ caracteres', 'Mayúscula', 'Número'].map(r => (
              <span key={r} className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                (r === '6+ caracteres' && newPw.length >= 6) || (r === 'Mayúscula' && /[A-Z]/.test(newPw)) || (r === 'Número' && /\d/.test(newPw))
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-muted-foreground border-white/10'
              }`}>{r}</span>
            ))}
          </div>
        )}
        <button onClick={changePassword} disabled={saving} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black disabled:opacity-50 flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Guardando...' : 'Actualizar Contraseña'}
        </button>
      </section>

      <section className="glass p-8 rounded-[32px] border border-rose-500/20 bg-rose-500/5 space-y-4">
        <h3 className="text-rose-500 font-black uppercase tracking-widest text-sm">Zona de Riesgo</h3>
        <div className="flex justify-between items-center">
          <div>
            <p className="font-bold">Eliminar Cuenta</p>
            <p className="text-sm text-muted-foreground">Elimina permanentemente tu cuenta y todos tus datos. Irreversible.</p>
          </div>
          <button onClick={deleteAccount} className="border border-rose-500/30 text-rose-500 px-5 py-2.5 rounded-xl font-bold hover:bg-rose-500/10 transition-all text-sm">Eliminar</button>
        </div>
      </section>
    </div>
  );
}

/* ─────────────── NOTIFICACIONES ─────────────── */
function NotificacionesTab() {
  const [txAlerts, setTxAlerts]     = useLocalPref('fp_notif_tx', true);
  const [budgetWarn, setBudgetWarn] = useLocalPref('fp_notif_budget', true);
  const [recurringHint, setRecurringHint] = useLocalPref('fp_notif_recurring', false);
  const { success } = useToast();

  const save = () => success('Preferencias guardadas');

  return (
    <section className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
      <h3 className="font-black text-lg">Alertas y Notificaciones</h3>
      <div className="space-y-4">
        <Toggle label="Confirmación de transacciones" description="Muestra un aviso al registrar cada movimiento." value={txAlerts} onChange={setTxAlerts} />
        <Toggle label="Aviso de presupuesto" description="Alerta cuando superas el 80% de un presupuesto mensual." value={budgetWarn} onChange={setBudgetWarn} />
        <Toggle label="Recordatorio de gastos recurrentes" description="Avisa cuando se aproxima el día de un gasto recurrente." value={recurringHint} onChange={setRecurringHint} />
      </div>
      <button onClick={save} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary/90 transition-all active:scale-95">Guardar Preferencias</button>
    </section>
  );
}

/* ─────────────── APARIENCIA ─────────────── */
function AparienciaTab() {
  const [compact, setCompact]     = useLocalPref('fp_compact', false);
  const [animations, setAnimations] = useLocalPref('fp_animations', true);
  const { success } = useToast();

  const save = () => {
    if (compact) document.documentElement.classList.add('compact'); else document.documentElement.classList.remove('compact');
    success('Apariencia guardada');
  };

  return (
    <section className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
      <h3 className="font-black text-lg">App & Estética</h3>
      <div className="space-y-4">
        <Toggle label="Modo compacto" description="Reduce el espaciado para mostrar más información en pantalla." value={compact} onChange={setCompact} />
        <Toggle label="Animaciones" description="Activa transiciones y micro-animaciones en la interfaz." value={animations} onChange={setAnimations} />
      </div>
      <button onClick={save} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary/90 transition-all active:scale-95">Aplicar Cambios</button>
    </section>
  );
}

/* ─────────────── REGIÓN ─────────────── */
const CURRENCIES = [
  { code: 'CLP', label: 'Peso Chileno (CLP)', example: '$1.250.000' },
  { code: 'USD', label: 'Dólar Estadounidense (USD)', example: '$1,250.00' },
  { code: 'EUR', label: 'Euro (EUR)', example: '€1.250,00' },
  { code: 'ARS', label: 'Peso Argentino (ARS)', example: '$1.250.000' },
];

function RegionTab() {
  const [currency, setCurrency] = useLocalPref('fp_currency', 'CLP');
  const [dateFormat, setDateFormat] = useLocalPref('fp_date_format', 'dd/mm/yyyy');
  const { success } = useToast();
  const selected = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0];

  return (
    <section className="glass p-8 rounded-[32px] border border-white/5 space-y-6">
      <h3 className="font-black text-lg">Región y Moneda</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Moneda de visualización</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50">
            {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-zinc-900">{c.label}</option>)}
          </select>
          <p className="text-xs text-muted-foreground ml-1">Ejemplo: <span className="text-primary font-bold">{selected.example}</span></p>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Formato de fecha</label>
          <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50">
            <option value="dd/mm/yyyy" className="bg-zinc-900">DD/MM/AAAA (ej: 23/03/2026)</option>
            <option value="mm/dd/yyyy" className="bg-zinc-900">MM/DD/AAAA (ej: 03/23/2026)</option>
            <option value="yyyy-mm-dd" className="bg-zinc-900">AAAA-MM-DD (ej: 2026-03-23)</option>
          </select>
        </div>
      </div>
      <button onClick={() => success('Región guardada')} className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black hover:bg-primary/90 transition-all active:scale-95">Guardar</button>
    </section>
  );
}

/* ─────────────── FACTURACIÓN ─────────────── */
function FacturacionTab({ profile, onUpgrade }: { profile: UserType; onUpgrade: () => void }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPay, setLoadingPay] = useState(true);
  const plan = PLAN_CONFIG[profile.plan] ?? PLAN_CONFIG['FREE'];
  const PlanIcon = plan.icon;

  useEffect(() => {
    api.get('/payments/history')
      .then(r => setPayments(Array.isArray(r.data) ? r.data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoadingPay(false));
  }, []);

  const subscriptionDate = payments.length > 0
    ? new Date(payments[payments.length - 1].createdAt)
    : profile.plan !== 'FREE' ? new Date(profile.createdAt) : null;

  return (
    <div className="space-y-6">
      {/* Plan actual */}
      <section className={`glass p-8 rounded-[32px] border ${plan.border} space-y-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${plan.bg} ${plan.border} border`}>
              <PlanIcon className={`w-6 h-6 ${plan.color}`} />
            </div>
            <div>
              <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-0.5">Plan Actual</p>
              <h3 className={`text-2xl font-black ${plan.color}`}>{plan.label}</h3>
            </div>
          </div>
          {(profile.plan === 'FREE' || profile.plan === 'PREMIUM') && (
            <button onClick={onUpgrade} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-primary/90 transition-all active:scale-95">
              {profile.plan === 'FREE' ? 'Subir a Premium' : 'Subir a Elite'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Miembro desde</p>
            <p className="font-bold text-sm">{new Date(profile.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          {subscriptionDate && profile.plan !== 'FREE' && (
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Suscripción activa desde</p>
              <p className="font-bold text-sm">{subscriptionDate.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
          )}
        </div>
      </section>

      {/* Historial de pagos */}
      <section className="glass p-8 rounded-[32px] border border-white/5 space-y-4">
        <h3 className="font-black text-lg">Historial de Pagos</h3>
        {loadingPay ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary w-6 h-6" /></div>
        ) : payments.length === 0 ? (
          <div className="py-10 text-center opacity-40">
            <CreditCard className="w-10 h-10 mx-auto mb-3" />
            <p className="font-bold">Sin pagos registrados</p>
            <p className="text-xs mt-1">Tus transacciones de suscripción aparecerán aquí.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Plan {p.plan}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-400">${p.amount.toLocaleString('es-CL')}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">{p.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ─────────────── SHARED COMPONENTS ─────────────── */
function InputField({ id, label, value, onChange, type = 'text' }: { id: string; label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <input id={id} type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all" />
    </div>
  );
}

function PasswordField({ id, label, value, onChange, show, onToggle }: any) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-12 text-sm font-bold focus:outline-none focus:border-primary/50 transition-all" />
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
      <div>
        <p className="font-bold text-sm">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

