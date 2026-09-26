import { useState, useEffect, useRef } from 'react'

export default function FeedbackHub() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorText, setErrorText] = useState('')
  const textareaRef = useRef(null)

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setErrorText('')
      // Small timeout to allow modal mount animation
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle ESC key to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen && status !== 'submitting') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, status])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = message.trim()

    if (!trimmed) {
      setErrorText('Please enter your feedback before submitting.')
      return
    }

    setErrorText('')
    setStatus('submitting')

    try {
      const response = await fetch('https://formspree.io/f/mwlpnzye', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ message: trimmed }),
      })

      if (response.ok) {
        setStatus('success')
        // Automatically close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false)
          setMessage('')
          setStatus('idle')
        }, 2000)
      } else {
        const data = await response.json().catch(() => ({}))
        setErrorText(
          data?.errors?.[0]?.message ||
          data?.error ||
          'Failed to send feedback. Please try again.'
        )
        setStatus('error')
      }
    } catch {
      setErrorText('Network error. Please check your connection and try again.')
      setStatus('error')
    }
  }

  return (
    <>
      {/* ── Persistent "☰" Menu Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Feedback Hub Menu"
        title="Feedback Hub"
        className="fixed top-4 right-4 sm:top-5 sm:right-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 hover:border-cyan-400/80 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_0_24px_rgba(6,182,212,0.45)] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer group"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200 group-hover:text-cyan-300 transition-colors"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ── Modal Popup ── */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-hub-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-300"
          onClick={(e) => {
            // Close if clicking outside the card
            if (e.target === e.currentTarget && status !== 'submitting') {
              setIsOpen(false)
            }
          }}
        >
          <div
            className="relative w-full max-w-lg bg-[#0e111c]/95 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-white/10 text-slate-100 transition-all duration-300 animate-[fade-slide-up_0.25s_ease-out]"
          >
            {/* Close Button (X) */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={status === 'submitting'}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {status === 'success' ? (
              /* ── Success Confirmation ── */
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-[icon-pop_0.4s_ease-out]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold text-white mb-2">
                  Thanks for your feedback!
                </h3>
                <p className="text-slate-300/80 text-sm max-w-xs">
                  Your thoughts help us make SwipeGame better. Closing shortly...
                </p>
              </div>
            ) : (
              /* ── Form View ── */
              <form onSubmit={handleSubmit} className="flex flex-col">
                {/* Header */}
                <div className="mb-5 pr-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-cyan-400/30 mb-2.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(34,211,238,0.8)]"></span>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-200">
                      Community Hub
                    </span>
                  </div>
                  <h2
                    id="feedback-hub-title"
                    className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent leading-snug"
                  >
                    Feedback Hub
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-300/80 leading-relaxed">
                    "We actually read every feedback you send"
                  </p>
                </div>

                {/* Text Area */}
                <div className="mb-4">
                  <label htmlFor="feedback-message" className="sr-only">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback-message"
                    ref={textareaRef}
                    rows={5}
                    value={message}
                    disabled={status === 'submitting'}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (errorText) setErrorText('')
                    }}
                    placeholder={"Share with us:\n-What we can improve\n- What you liked or disliked\n- Any bugs or issues you found"}
                    className="w-full p-4 rounded-2xl bg-slate-950/85 border border-white/15 text-slate-100 placeholder:text-slate-400/75 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 outline-none resize-none transition-all text-sm sm:text-base leading-relaxed disabled:opacity-50"
                  />
                  {errorText && (
                    <p className="mt-2 text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {errorText}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={status === 'submitting'}
                    className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-sm font-semibold transition-all cursor-pointer disabled:opacity-40"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm sm:text-base font-bold text-white rounded-xl cursor-pointer bg-gradient-to-r from-cyan-500 via-teal-500 to-pink-500 border border-white/20 shadow-[0_4px_18px_rgba(6,182,212,0.4)] hover:shadow-[0_6px_25px_rgba(236,72,153,0.55)] hover:scale-[1.02] active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {status === 'submitting' ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
