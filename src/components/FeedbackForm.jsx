import { useState, useRef } from 'react'

const DEFAULT_FEEDBACK_PLACEHOLDER = "Share with us:\n- What we can improve\n- What you liked or disliked\n- Any bugs or issues you found"

export default function FeedbackForm({
  isPage = false,
  onCancel,
  placeholder = DEFAULT_FEEDBACK_PLACEHOLDER,
}) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'submitting' | 'success' | 'error'
  const [errorText, setErrorText] = useState('')
  const textareaRef = useRef(null)

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
        setMessage('')
        if (onCancel && !isPage) {
          setTimeout(() => {
            onCancel()
            setStatus('idle')
          }, 2000)
        }
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

  if (status === 'success') {
    return (
      <div className="py-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-[icon-pop_0.4s_ease-out]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-extrabold text-white mb-2">
          Thanks for reaching out!
        </h3>
        <p className="text-slate-300/80 text-sm max-w-sm mb-4">
          Your message has been sent directly to our team. We read every message and appreciate your support.
        </p>
        {isPage && (
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            Send Another Message
          </button>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="mb-4">
        <label htmlFor="feedback-form-message" className="sr-only">
          Your Message
        </label>
        <textarea
          id="feedback-form-message"
          ref={textareaRef}
          rows={5}
          value={message}
          disabled={status === 'submitting'}
          onChange={(e) => {
            setMessage(e.target.value)
            if (errorText) setErrorText('')
          }}
          placeholder={placeholder}
          className="w-full p-4 rounded-2xl bg-white/8 border border-white/20 text-slate-100 placeholder:text-slate-300/65 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 focus:bg-white/12 outline-none resize-none transition-all text-sm sm:text-base leading-relaxed disabled:opacity-50"
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

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={status === 'submitting'}
            className="px-4 py-2.5 rounded-xl border border-white/20 hover:border-cyan-400/40 bg-white/8 hover:bg-white/15 text-slate-200 hover:text-white text-sm font-semibold backdrop-blur-sm transition-all cursor-pointer disabled:opacity-40 shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
          >
            Cancel
          </button>
        )}

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
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
