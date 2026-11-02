import { useState, useEffect, useRef } from 'react'
import FeedbackForm from './FeedbackForm'

export default function FeedbackHub({ onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const menuRef = useRef(null)
  const buttonRef = useRef(null)

  // Handle ESC key to close menu and modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        if (isModalOpen) {
          setIsModalOpen(false)
        } else if (isMenuOpen) {
          setIsMenuOpen(false)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen, isMenuOpen])

  // Handle click outside dropdown to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  function handleNavigate(path) {
    setIsMenuOpen(false)
    if (onNavigate) {
      onNavigate(path)
    }
  }

  return (
    <>
      {/* ── Persistent "☰" Menu Button ── */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-label="Site Navigation Menu"
        aria-expanded={isMenuOpen}
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 hover:border-cyan-400/80 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-200 group-hover:text-cyan-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Small Glass Dropdown Menu ── */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="fixed top-14 right-4 sm:top-16 sm:right-6 z-50 w-52 bg-[#0c1022]/90 backdrop-blur-2xl border border-white/20 rounded-2xl p-1.5 shadow-[0_16px_40px_rgba(0,0,0,0.7),0_0_24px_rgba(6,182,212,0.18)] animate-[modal-pop_0.15s_cubic-bezier(0.16,1,0.3,1)_both]"
        >
          <div className="flex flex-col gap-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsMenuOpen(false)
                setIsModalOpen(true)
              }}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:text-cyan-300 hover:bg-white/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span>Send Feedback</span>
            </button>

            <div className="h-px bg-white/10 my-1 mx-1.5" />

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/about')}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>About</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/contact')}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Contact</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/privacy')}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={() => handleNavigate('/terms')}
              className="w-full text-left px-3 py-2 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Terms</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Feedback Modal Popup ── */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-hub-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/50 backdrop-blur-sm transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false)
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1f4e]/92 via-[#1e1545]/92 to-[#2a1040]/92 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_50px_rgba(6,182,212,0.18),0_0_80px_rgba(236,72,153,0.12)] ring-1 ring-cyan-400/15 text-slate-100 transition-all duration-300 animate-[modal-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)_both]">
            {/* Close Button (X) */}
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="mb-5 pr-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/25 to-pink-500/20 border border-cyan-400/50 mb-2.5 shadow-[0_0_14px_rgba(34,211,238,0.3)]">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.9)]"></span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-200">
                  Community Hub
                </span>
              </div>
              <h2
                id="feedback-hub-title"
                className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent leading-snug"
              >
                💬 Feedback Hub
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                "We actually read every feedback you send"
              </p>
            </div>

            <FeedbackForm onCancel={() => setIsModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
