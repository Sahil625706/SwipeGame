export function PageBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      style={{
        background: 'linear-gradient(to right, #b91c1c 0%, #b91c1c 46%, #1d4ed8 54%, #1d4ed8 100%)',
        opacity: 1,
        filter: 'blur(16px)',
        transform: 'scale(1.04)',
      }}
    />
  )
}

export default function PageLayout({ title, badge = 'Information', children, onHome }) {
  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-start px-4 py-8 sm:py-12 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <PageBackground />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-start">
        {/* Back / Home Button */}
        <button
          type="button"
          onClick={onHome}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-cyan-400/60 text-white text-sm font-bold shadow-[0_0_16px_rgba(6,182,212,0.35)] hover:bg-slate-800 hover:border-cyan-400 hover:shadow-[0_0_24px_rgba(6,182,212,0.55)] hover:-translate-x-1 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </button>

        {/* Content Card */}
        <div className="w-full bg-[#0c1022]/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(6,182,212,0.12)]">
          {/* Header */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-cyan-400/30 mb-3 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-200">
                {badge}
              </span>
            </div>
            <h1 className="font-baloo font-['Baloo_2',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent leading-tight">
              {title}
            </h1>
          </header>

          {/* Main Body */}
          <div className="space-y-6 text-slate-200/90 text-sm sm:text-base leading-relaxed font-normal">
            {children}
          </div>

          {/* Bottom Home Button */}
          <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onHome}
              className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>← Back to SwipeGame</span>
            </button>
            <span className="text-[11px] text-slate-500">SwipeGame</span>
          </div>
        </div>
      </div>
    </div>
  )
}
