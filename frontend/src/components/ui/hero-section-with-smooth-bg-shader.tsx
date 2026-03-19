import { MeshGradient } from "@paper-design/shaders-react"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  title?: string
  highlightText?: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  colors?: string[]
  distortion?: number
  swirl?: number
  speed?: number
  offsetX?: number
  className?: string
  titleClassName?: string
  descriptionClassName?: string
  buttonClassName?: string
  maxWidth?: string
  veilOpacity?: string
  fontFamily?: string
  fontWeight?: number
}

export function HeroSection({
  title = "Tus Finanzas,",
  highlightText = "Dominadas Sin Esfuerzo.",
  description = "Finance pro te empodera para gestionar, hacer crecer y asegurar tu patrimonio con seguimiento inteligente, herramientas de inversión y claridad absoluta.",
  buttonText = "Comienza Tu Viaje Hoy",
  onButtonClick,
  colors = ["#3b82f6", "#2dd4bf", "#8b5cf6", "#0f172a", "#1e1b4b", "#312e81"],
  distortion = 0.8,
  swirl = 0.6,
  speed = 0.42,
  offsetX = 0.08,
  className = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
  maxWidth = "max-w-6xl",
  veilOpacity = "bg-white/5 dark:bg-black/40",
  fontFamily = "Inter, sans-serif",
  fontWeight = 800,
}: HeroSectionProps) {
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const update = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick()
    }
  }

  return (
    <section className={`relative w-full min-h-screen overflow-hidden bg-background flex items-center justify-center ${className}`}>
      <div className="fixed inset-0 w-screen h-screen">
        {mounted && (
          <>
            <MeshGradient
              width={dimensions.width}
              height={dimensions.height}
              colors={colors}
              distortion={distortion}
              swirl={swirl}
              grainMixer={0}
              grainOverlay={0}
              speed={speed}
              offsetX={offsetX}
            />
            <div className={`absolute inset-0 pointer-events-none backdrop-blur-[100px] ${veilOpacity}`} />
          </>
        )}
      </div>
      
      <div className={`relative z-10 ${maxWidth} mx-auto px-6 w-full`}>
        <div className="text-center">
          <h1
            className={`font-black text-foreground text-balance text-5xl sm:text-6xl md:text-7xl xl:text-[90px] leading-tight sm:leading-tight md:leading-tight lg:leading-tight xl:leading-[1.05] mb-8 tracking-tighter ${titleClassName}`}
            style={{ fontFamily, fontWeight }}
          >
            {title} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 drop-shadow-sm">
              {highlightText}
            </span>
          </h1>
          <p className={`text-xl sm:text-2xl text-muted-foreground text-pretty max-w-3xl mx-auto leading-relaxed mb-12 px-4 font-medium ${descriptionClassName}`}>
            {description}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleButtonClick}
              className={`group relative px-8 py-5 rounded-2xl bg-primary text-white font-bold text-lg hover:scale-105 transition-all shadow-2xl shadow-primary/25 ${buttonClassName}`}
            >
              <span className="relative z-10">{buttonText}</span>
              <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            <button
              className="px-8 py-5 rounded-2xl glass border border-white/10 font-bold text-lg hover:bg-white/5 transition-all"
            >
              Ver Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
