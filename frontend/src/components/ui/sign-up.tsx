import React, { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

// --- HELPER COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all focus-within:border-primary/50 focus-within:bg-primary/5">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: { avatarSrc: string, name: string, handle: string, text: string }, delay: string }) => (
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

export const SignUpPage = ({
  title = <span className="font-light text-foreground tracking-tighter">Únete</span>,
  description = "Crea tu cuenta y comienza tu viaje hacia la libertad financiera.",
  heroImageSrc,
  testimonials = [],
  onSubmit,
  error,
  loading,
  onLoginLink
}: any) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row bg-background w-[100dvw] overflow-hidden">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tighter italic">{title}</h1>
            <p className="text-muted-foreground font-medium">{description}</p>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-2xl animate-shake">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Nombre Completo</label>
                <GlassInputWrapper>
                  <input 
                    name="nombre" 
                    type="text" 
                    required
                    placeholder="Tu nombre completo" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Email</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    required
                    placeholder="tu@email.com" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-2 mb-2 block">Contraseña</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      required
                      placeholder="••••••••" 
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none placeholder:text-zinc-700" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-2xl bg-primary py-4 font-black text-white hover:bg-primary/90 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20 disabled:opacity-50"
              >
                {loading ? 'Creando cuenta...' : 'Crear cuenta en Finance pro'}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-muted-foreground">
              ¿Ya tienes cuenta? <button onClick={onLoginLink} className="text-primary hover:underline transition-colors font-bold ml-1">Inicia sesión</button>
            </p>
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
