import { useState, useEffect } from 'react'

const STORAGE_KEY = 'swipegame_cookie_consent'

export default function CookieBanner({ onNavigate }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem(STORAGE_KEY)
      if (!consent) {
        setIsVisible(true)
      }
    } catch (_) {
      setIsVisible(true)
    }
  }, [])

  function handleChoice(choice) {
    try {
      localStorage.setItem(STORAGE_KEY, choice)
    } catch (_) {}
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div
      role="region"
      aria-label="Cookie Preferences"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090b14]/95 border-t border-white/10 backdrop-blur-md px-3 sm:px-6 py-2 sm:py-2.5 shadow-[0_-4px_24px_rgba(0,0,0,0.6)] animate-[fade-slide-up_0.3s_ease-out]"
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <p className="text-slate-300 text-xs sm:text-[13px] text-center sm:text-left leading-normal">
          We use cookies and local storage to save your audio preferences and deliver a smooth experience. Learn more in our{' '}
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/privacy')}
            className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer inline transition-colors"
          >
            Privacy Policy
          </button>
          .
        </p>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => handleChoice('declined')}
            className="px-3 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => handleChoice('accepted')}
            className="px-4 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all cursor-pointer"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
