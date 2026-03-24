import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);


// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  error?: string | null;
  loading?: boolean;
  defaultRegister?: boolean;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:bg-primary/5">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/10 p-5 w-64 shadow-2xl`}>
    <Image src={testimonial.avatarSrc} alt="avatar" width={40} height={40} className="h-10 w-10 object-cover rounded-2xl" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium text-white">{testimonial.name}</p>
      <p className="text-zinc-500">{testimonial.handle}</p>
      <p className="mt-1 text-zinc-300">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title,
  description,
  heroImageSrc,
  testimonials = [],
  onSubmit,
  onGoogleSignIn,
  onResetPassword,
  error,
  loading,
  defaultRegister = false
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(defaultRegister);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-background w-[100dvw] overflow-hidden">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter italic">
                {isRegister ? "Únete a la elite" : title}
            </h1>
            <p className="text-muted-foreground font-medium">
                {isRegister ? "Empieza hoy mismo a escalar tu patrimonio con Finance pro." : description}
            </p>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <input type="hidden" name="mode" value={isRegister ? 'register' : 'login'} />
              
              {isRegister && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                    <label htmlFor="nombre" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Nombre completo</label>
                    <GlassInputWrapper>
                    <input 
                        id="nombre"
                        name="nombre" 
                        type="text" 
                        required={isRegister}
                        autoComplete="name"
                        placeholder="Juan Pérez" 
                        className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                    />
                    </GlassInputWrapper>
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Email</label>
                <GlassInputWrapper>
                  <input 
                    id="email"
                    name="email" 
                    type="email" 
                    required
                    autoComplete="email username"
                    placeholder="tu@email.com" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label htmlFor="password" className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Contraseña</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      id="password"
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      autoComplete={isRegister ? "new-password" : "current-password"}
                      placeholder="••••••••" 
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              {!isRegister && (
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest px-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" name="rememberMe" className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary shadow-sm" />
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">Recordarme</span>
                    </label>
                    <button type="button" onClick={onResetPassword} className="hover:text-primary transition-colors text-muted-foreground">Recuperar clave</button>
                  </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-4 font-black text-white hover:bg-primary/90 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : (isRegister ? 'Crear mi cuenta gratis' : 'Entrar en Finance pro')}
              </button>
            </form>

            <div className="relative flex items-center justify-center py-4">
              <span className="w-full border-t border-white/5"></span>
              <span className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-background absolute">O continúa con</span>
            </div>

            <button onClick={onGoogleSignIn} className="w-full flex items-center justify-center gap-3 border border-white/10 rounded-2xl py-4 hover:bg-white/5 transition-all font-bold text-sm">
                <GoogleIcon />
                Google
            </button>

            <div className="text-center text-sm font-medium text-muted-foreground">
              {isRegister ? (
                  <>¿Ya tienes cuenta? <button onClick={() => setIsRegister(false)} className="text-primary hover:underline transition-colors font-bold ml-1">Inicia sesión</button></>
              ) : (
                  <>¿Nuevo en la plataforma? <button onClick={() => setIsRegister(true)} className="text-primary hover:underline transition-colors font-bold ml-1">Crea una cuenta</button></>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div 
            className="absolute inset-4 rounded-3xl bg-cover bg-center grayscale opacity-40 mix-blend-luminosity border border-white/5 shadow-2xl" 
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          ></div>
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-t from-background via-transparent to-transparent"></div>
          
          {testimonials.length > 0 && (
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
