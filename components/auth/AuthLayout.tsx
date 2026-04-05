'use client';

import { Film, Camera, Clapperboard, Video, Aperture } from 'lucide-react';

const floatingIcons = [
  { Icon: Film, top: '15%', left: '12%', delay: 0, size: 28 },
  { Icon: Camera, top: '35%', right: '15%', delay: 0.8, size: 24 },
  { Icon: Clapperboard, bottom: '25%', left: '18%', delay: 1.6, size: 22 },
  { Icon: Video, top: '60%', right: '10%', delay: 2.2, size: 26 },
  { Icon: Aperture, top: '80%', left: '35%', delay: 0.5, size: 20 },
];

export default function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A]">
      {/* Left panel — visual/brand (hidden on mobile) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col items-center justify-center overflow-hidden border-r border-white/[0.06]">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)]" />

        {/* Grid HUD lines */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(5deg); }
          }
          @keyframes float-alt {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-12px) rotate(-5deg); }
          }
          .float-icon-0 { animation: float 6s ease-in-out infinite; }
          .float-icon-1 { animation: float-alt 6s ease-in-out infinite 0.8s; }
          .float-icon-2 { animation: float 6s ease-in-out infinite 1.6s; }
          .float-icon-3 { animation: float-alt 6s ease-in-out infinite 2.2s; }
          .float-icon-4 { animation: float 6s ease-in-out infinite 0.5s; }
        `}</style>

        {/* Floating film icons */}
        {floatingIcons.map((item, i) => {
          const { Icon, size, ...pos } = item;
          return (
            <div
              key={i}
              className={`absolute text-[#8B5CF6]/25 float-icon-${i}`}
              style={pos as React.CSSProperties}
            >
              <Icon size={size} />
            </div>
          );
        })}

        {/* Content */}
        <div className="relative z-10 px-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-800">
          {/* W logo */}
          <div className="relative inline-block mb-8">
            <div className="absolute -inset-8 bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,transparent_70%)] animate-pulse" />
            <span className="relative font-display text-[100px] font-extrabold leading-none bg-gradient-to-br from-[#7C3AED] via-[#A855F7] to-[#C026D3] bg-clip-text text-transparent">
              W
            </span>
          </div>

          <h2 className="font-display text-[28px] font-bold text-white mb-3 leading-tight drop-shadow-[0_0_24px_rgba(139,92,246,0.3)]">
            Sua produ&ccedil;&atilde;o criativa<br />come&ccedil;a aqui.
          </h2>
          <p className="text-[15px] text-zinc-300 leading-relaxed max-w-xs mx-auto">
            24 agentes de IA especializados para criadores de v&iacute;deo.
          </p>
        </div>

        {/* Sparkle decorations */}
        <div className="pointer-events-none absolute top-[20%] right-[25%] text-[#8B5CF6]/20 text-lg select-none">&#10022;</div>
        <div className="pointer-events-none absolute bottom-[15%] left-[20%] text-[#C026D3]/15 text-sm select-none">&#10022;</div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right-4 duration-600 delay-100">
          <div className="rounded-2xl border border-white/[0.08] bg-[#161616]/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-black/20">
            <h1 className="font-display text-[26px] font-bold text-white mb-1.5">
              {title}
            </h1>
            <p className="text-[15px] text-[#A0A0A0] mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
