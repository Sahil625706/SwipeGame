import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center p-6 bg-[#090a0f] selection:bg-pink-500 selection:text-white overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="fixed inset-0 pointer-events-none overflow-hidden z-0"
            style={{
              background: 'linear-gradient(to right, #b91c1c 0%, #b91c1c 46%, #1d4ed8 54%, #1d4ed8 100%)',
              opacity: 0.35,
              filter: 'blur(30px)',
              transform: 'scale(1.05)',
            }}
          />

          <div className="relative z-10 w-full max-w-md p-8 rounded-3xl bg-[#0c0e18]/90 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center flex flex-col items-center">
            {/* Warning Icon */}
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 shadow-[0_0_25px_rgba(244,63,94,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              An unexpected error occurred while loading this screen.
            </p>

            {this.state.error?.message && (
              <div className="w-full mb-6 p-3 rounded-xl bg-black/40 border border-white/10 text-left overflow-x-auto text-xs text-rose-300 font-mono">
                {this.state.error.message}
              </div>
            )}

            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-pink-500 border border-white/20 shadow-[0_4px_18px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
