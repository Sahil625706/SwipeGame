import { useState, useRef, useEffect } from 'react'
import { questions } from '../data/questions'

// ── Fisher-Yates shuffle (used only in Classic / Everything mode) ──
function shuffleArray(arr) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ── Confetti burst — pure JS DOM particles, no external libraries ──
const CONFETTI_COLORS = [
  '#22d3ee', '#f472b6', '#a78bfa', '#34d399',
  '#fbbf24', '#60a5fa', '#f87171', '#4ade80',
]
function launchConfetti(count = 95) {
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    el.className = 'confetti-particle'
    const size = 7 + Math.random() * 9
    const isCircle = Math.random() > 0.5
    el.style.cssText = [
      `width:${size}px`,
      `height:${isCircle ? size : size * 2.2}px`,
      `left:${5 + Math.random() * 90}vw`,
      `background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}`,
      `animation-duration:${1.6 + Math.random() * 2.2}s`,
      `animation-delay:${Math.random() * 0.9}s`,
      `border-radius:${isCircle ? '50%' : '3px'}`,
      'opacity:1',
    ].join(';')
    document.body.appendChild(el)
    const totalMs =
      (parseFloat(el.style.animationDuration) +
        parseFloat(el.style.animationDelay)) * 1000
    setTimeout(() => el.remove(), totalMs + 200)
  }
}

// ── Format elapsed seconds → "Xm Ys" or "Xs" ──
function formatTime(secs) {
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

export default function ComparisonScreen({ category, onBackToCategories }) {
  // ── Raw data pool for the selected category ──
  const categoryData = category?.getQuestions
    ? category.getQuestions()
    : questions.filter((q) => !q.excludeFromEverything)

  // ── Check whether this category runs the Survivor-Bracket mechanic ──
  const isSurvivor = Boolean(
    category?.isSurvivor || (categoryData[0]?.name && categoryData[0]?.image)
  )

  // ── Global timing refs ──
  const startTimeRef = useRef(Date.now())
  const pickTimesRef = useRef([])
  const confettiFiredRef = useRef(false)

  // ── Common End screen state ──
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [fastestIdx, setFastestIdx] = useState(null)
  const [shareLabel, setShareLabel] = useState('Share Results')

  // =========================================================================
  // ── SURVIVOR BRACKET STATE ──
  // =========================================================================
  // In survivor mode, items appear in exact order (item 1 vs item 2, loser replaced by 3, etc.)
  const [survivorPool, setSurvivorPool] = useState(() => (isSurvivor ? categoryData : []))
  const [leftItem, setLeftItem] = useState(() => (isSurvivor ? categoryData[0] || null : null))
  const [rightItem, setRightItem] = useState(() => (isSurvivor ? categoryData[1] || null : null))
  const [nextPoolIndex, setNextPoolIndex] = useState(2)
  const [survivorHistory, setSurvivorHistory] = useState([]) // stack of { leftItem, rightItem, nextPoolIndex }
  const [champion, setChampion] = useState(null)
  const [selectedSide, setSelectedSide] = useState(null) // 'optionA' (left) | 'optionB' (right)
  const [isSurvivorCompleted, setIsSurvivorCompleted] = useState(false)

  // =========================================================================
  // ── CLASSIC (EVERYTHING) MODE STATE ──
  // =========================================================================
  const [shuffledQuestions, setShuffledQuestions] = useState(() =>
    !isSurvivor ? shuffleArray(categoryData) : []
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)

  // Transition lock shared by both modes
  const [isTransitioning, setIsTransitioning] = useState(false)

  // ── Reset when category changes ──
  useEffect(() => {
    const data = category?.getQuestions
      ? category.getQuestions()
      : questions.filter((q) => !q.excludeFromEverything)

    const isSurv = Boolean(
      category?.isSurvivor || (data[0]?.name && data[0]?.image)
    )

    if (isSurv) {
      setSurvivorPool(data)
      setLeftItem(data[0] || null)
      setRightItem(data[1] || null)
      setNextPoolIndex(2)
      setSurvivorHistory([])
      setChampion(null)
      setSelectedSide(null)
      setIsSurvivorCompleted(false)
    } else {
      setShuffledQuestions(shuffleArray(data))
      setCurrentIndex(0)
      setSelectedOption(null)
    }

    setIsTransitioning(false)
    startTimeRef.current = Date.now()
    pickTimesRef.current = []
    confettiFiredRef.current = false
    setShareLabel('Share Results')
    setFastestIdx(null)
    setElapsedSecs(0)
  }, [category])

  // =========================================================================
  // ── COMPLETION LOGIC ──
  // =========================================================================
  const isCompleted = isSurvivor
    ? isSurvivorCompleted
    : currentIndex >= shuffledQuestions.length

  useEffect(() => {
    if (isCompleted && !confettiFiredRef.current) {
      confettiFiredRef.current = true
      launchConfetti(100)
      const secs = Math.round((Date.now() - startTimeRef.current) / 1000)
      setElapsedSecs(secs)
      const picks = pickTimesRef.current
      if (picks.length >= 2) {
        let minGap = Infinity, minIdx = 0
        for (let i = 1; i < picks.length; i++) {
          const gap = picks[i] - picks[i - 1]
          if (gap < minGap) { minGap = gap; minIdx = i }
        }
        setFastestIdx(minIdx)
      }
    }
  }, [isCompleted])

  // =========================================================================
  // ── SURVIVOR SELECTION HANDLER ──
  // =========================================================================
  const handleSelectSurvivor = (winnerSide) => {
    if (isTransitioning || isSurvivorCompleted) return
    pickTimesRef.current.push(Date.now())
    setSelectedSide(winnerSide)
    setIsTransitioning(true)

    // Save current snapshot for "Back"
    const snapshot = {
      leftItem,
      rightItem,
      nextPoolIndex,
    }

    setTimeout(() => {
      setSurvivorHistory((prev) => [...prev, snapshot])

      if (winnerSide === 'optionA') {
        // Left wins, right was the loser
        if (nextPoolIndex < survivorPool.length) {
          // Replace loser (right) with next unseen pool item
          setRightItem(survivorPool[nextPoolIndex])
          setNextPoolIndex((prev) => prev + 1)
        } else {
          // Pool exhausted, Left is the Champion!
          setChampion(leftItem)
          setIsSurvivorCompleted(true)
        }
      } else {
        // Right wins, left was the loser
        if (nextPoolIndex < survivorPool.length) {
          // Replace loser (left) with next unseen pool item
          setLeftItem(survivorPool[nextPoolIndex])
          setNextPoolIndex((prev) => prev + 1)
        } else {
          // Pool exhausted, Right is the Champion!
          setChampion(rightItem)
          setIsSurvivorCompleted(true)
        }
      }

      setSelectedSide(null)
      setIsTransitioning(false)
    }, 300)
  }

  // =========================================================================
  // ── CLASSIC SELECTION HANDLER ──
  // =========================================================================
  const currentQuestion = !isSurvivor ? shuffledQuestions[currentIndex] : null

  const handleSelectClassic = (optionKey) => {
    if (isTransitioning) return
    pickTimesRef.current.push(Date.now())
    setSelectedOption(optionKey)
    setIsTransitioning(true)

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setIsTransitioning(false)
    }, 320)
  }

  // =========================================================================
  // ── BACK HANDLER ──
  // =========================================================================
  const canGoBack = isSurvivor
    ? survivorHistory.length > 0
    : currentIndex > 0

  const handleBack = () => {
    if (!canGoBack || isTransitioning) return

    if (pickTimesRef.current.length > 0) {
      pickTimesRef.current.pop()
    }

    if (isSurvivor) {
      // Revert to previous bracket state
      setSurvivorHistory((prev) => {
        if (prev.length === 0) return prev
        const nextStack = [...prev]
        const last = nextStack.pop()
        setLeftItem(last.leftItem)
        setRightItem(last.rightItem)
        setNextPoolIndex(last.nextPoolIndex)
        setChampion(null)
        setIsSurvivorCompleted(false)
        confettiFiredRef.current = false
        return nextStack
      })
      setSelectedSide(null)
      setIsTransitioning(false)
    } else {
      setSelectedOption(null)
      setIsTransitioning(false)
      setCurrentIndex((prev) => prev - 1)
    }
  }

  // =========================================================================
  // ── RESTART HANDLER ──
  // =========================================================================
  const handleRestart = () => {
    if (isSurvivor) {
      setSurvivorPool(categoryData)
      setLeftItem(categoryData[0] || null)
      setRightItem(categoryData[1] || null)
      setNextPoolIndex(2)
      setSurvivorHistory([])
      setChampion(null)
      setSelectedSide(null)
      setIsSurvivorCompleted(false)
    } else {
      setShuffledQuestions(shuffleArray(categoryData))
      setCurrentIndex(0)
      setSelectedOption(null)
    }
    setIsTransitioning(false)
    startTimeRef.current = Date.now()
    pickTimesRef.current = []
    confettiFiredRef.current = false
    setShareLabel('Share Results')
    setFastestIdx(null)
    setElapsedSecs(0)
  }

  // =========================================================================
  // ── SHARE HANDLER ──
  // =========================================================================
  const handleShare = () => {
    const text = isSurvivor && champion
      ? `🏆 ${champion.name} is my Ultimate Champion in ${category?.title || 'Face Off'} on SwipeGame! Can you beat my bracket in ${formatTime(elapsedSecs)}? 🎮`
      : `I just finished SwipeGame (${category?.title || 'All'}) — ${shuffledQuestions.length} choices in ${formatTime(elapsedSecs)}! 🎮 Can you beat my time?`

    navigator.clipboard.writeText(text)
      .then(() => { setShareLabel('Copied! ✓'); setTimeout(() => setShareLabel('Share Results'), 2500) })
      .catch(() => { setShareLabel('Copy failed'); setTimeout(() => setShareLabel('Share Results'), 2000) })
  }

  // ── Progress calculations ──
  const totalBattles = isSurvivor ? Math.max(1, survivorPool.length - 1) : shuffledQuestions.length
  const currentBattle = isSurvivor
    ? Math.min(survivorHistory.length + 1, totalBattles)
    : currentIndex + 1
  const progressPercent = isSurvivor
    ? Math.min(100, Math.round((currentBattle / totalBattles) * 100))
    : Math.min(100, Math.round((currentBattle / Math.max(1, shuffledQuestions.length)) * 100))

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* Split Background: #b91c1c Red (Left) & #1d4ed8 Blue (Right) at 100% Opacity */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
        style={{
          background: 'linear-gradient(to right, #b91c1c 0%, #b91c1c 46%, #1d4ed8 54%, #1d4ed8 100%)',
          opacity: 1,
          filter: 'blur(16px)',
          transform: 'scale(1.04)',
        }}
      />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header / Title */}
        <header className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          {/* Mode Badge - Centered as the primary focus option */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
            <span className="text-xs font-bold tracking-widest uppercase text-cyan-200">
              {category?.title ? `Mode: ${category.title}` : 'Interactive Choice Game'}
            </span>
          </div>

          <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
            SwipeGame
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
            {isSurvivor
              ? 'Survivor Bracket: Winner stays, loser gets replaced!'
              : 'This or That? Pick your ultimate favorite!'}
          </p>
        </header>

        {isCompleted ? (
          /* ════════════ GAME COMPLETED / CHAMPION STATE ════════════ */
          <div
            className="w-full max-w-lg text-center"
            style={{ animation: 'fade-slide-up 0.55s ease both' }}
          >
            <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-white/5">

              {isSurvivor && champion ? (
                /* ─── SURVIVOR CHAMPION DISPLAY ─── */
                <div className="flex flex-col items-center">
                  <div className="icon-pop glow-pulse w-20 h-20 rounded-2xl mb-4 flex items-center justify-center bg-gradient-to-tr from-amber-500/30 via-yellow-400/25 to-pink-500/25 border border-yellow-400/40 text-yellow-300 text-4xl shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                    👑
                  </div>

                  <div className="inline-block px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-3 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                    Ultimate Champion
                  </div>

                  <h2 className="font-['Outfit',sans-serif] text-3xl sm:text-4xl font-black tracking-tight leading-tight text-white mb-5">
                    {champion.name}
                  </h2>

                  {/* Champion Image Card */}
                  <div className="relative w-full max-w-xs aspect-[4/3] rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow-[0_0_40px_rgba(251,191,36,0.35)] bg-[#0a0b12] mb-6 p-2 ring-2 ring-yellow-400/20">
                    <img
                      src={champion.image}
                      alt={champion.name}
                      className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                    />
                  </div>

                  <p className="text-slate-300/90 text-sm sm:text-base mb-6 font-medium">
                    Survived <span className="text-amber-300 font-bold">{totalBattles} face-offs</span> to claim the crown in <span className="text-cyan-300 font-bold">{category?.title}</span>!
                  </p>
                </div>
              ) : (
                /* ─── CLASSIC COMPLETED DISPLAY ─── */
                <div>
                  <div className="icon-pop glow-pulse w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-tr from-cyan-500/25 to-pink-500/25 border border-white/20 text-cyan-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <h2 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent mb-3">
                    You're all done!
                  </h2>
                  <p className="text-slate-300/80 text-sm sm:text-base mb-6">
                    You powered through all <span className="text-pink-400 font-bold">{shuffledQuestions.length}</span> {shuffledQuestions.length === 1 ? 'comparison' : 'comparisons'}. Impressive!
                  </p>
                </div>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                  <p className="text-xs font-semibold tracking-widest uppercase text-cyan-300/80 mb-1">Total time</p>
                  <p className="font-['Outfit',sans-serif] text-2xl font-black text-white">{formatTime(elapsedSecs)}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                  <p className="text-xs font-semibold tracking-widest uppercase text-pink-300/80 mb-1">
                    {isSurvivor ? 'Contenders' : 'Fastest pick'}
                  </p>
                  <p className="font-['Outfit',sans-serif] text-2xl font-black text-white">
                    {isSurvivor ? survivorPool.length : (fastestIdx !== null ? `Q${fastestIdx + 1}` : '—')}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {/* Play Again */}
                <button
                  onClick={handleRestart}
                  className="group font-['Outfit',sans-serif] inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white rounded-2xl cursor-pointer bg-gradient-to-r from-cyan-500 via-teal-500 to-pink-500 border border-white/20 shadow-[0_6px_25px_rgba(6,182,212,0.4)] hover:shadow-[0_10px_40px_rgba(236,72,153,0.65)] hover:scale-[1.05] hover:brightness-110 active:scale-95 transition-all duration-200"
                >
                  <span>Play Again</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>

                {/* Home Button */}
                {onBackToCategories && (
                  <button
                    onClick={onBackToCategories}
                    className="group font-['Outfit',sans-serif] inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-cyan-400/40 hover:text-white hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Home</span>
                  </button>
                )}

                {/* Share */}
                <button
                  onClick={handleShare}
                  className="group font-['Outfit',sans-serif] inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-white/35 hover:text-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>{shareLabel}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ════════════ ACTIVE COMPARISON SCREEN ════════════ */
          <div className="w-full flex flex-col items-center">
            {/* Top Bar with Back Button, Center Counter, Home Button, and Progress Indicator */}
            {/* Unified max-width container: both the nav row and progress bar are constrained together */}
            <div className="w-full max-w-xl mb-6 sm:mb-8 flex flex-col">
              <div className="flex items-center justify-between w-full text-xs font-semibold tracking-wider text-slate-300 mb-3 min-h-[36px]">
                {/* Back Button (hidden on first question/battle, but keeps spacing balance) */}
                {canGoBack ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isTransitioning}
                    className="group inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-slate-800/95 hover:bg-slate-700 text-slate-200 hover:text-white border border-cyan-400/40 hover:border-cyan-400/80 backdrop-blur-md text-xs font-bold tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:-translate-x-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>
                ) : (
                  <div className="w-16 sm:w-20" />
                )}

                {/* Center Counter */}
                <span className="flex items-center gap-1.5 text-cyan-200 text-xs font-semibold tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {isSurvivor ? (
                    <>
                      Face-Off <span className="text-white font-bold">{currentBattle}</span> of {totalBattles}
                    </>
                  ) : (
                    <>
                      Question <span className="text-white font-bold">{currentIndex + 1}</span> of {shuffledQuestions.length}
                    </>
                  )}
                </span>

                {/* Home Button (Top Right — right edge aligns with progress bar end) */}
                {onBackToCategories ? (
                  <button
                    type="button"
                    onClick={onBackToCategories}
                    className="group inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-slate-800/95 hover:bg-slate-700 text-slate-200 hover:text-white border border-cyan-400/40 hover:border-cyan-400/80 backdrop-blur-md text-xs font-bold tracking-wide shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-cyan-400 transition-transform duration-200 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Home</span>
                  </button>
                ) : (
                  <div className="w-16 sm:w-20" />
                )}
              </div>

              {/* Progress Bar — full width matches nav row.
                   % is overlaid INSIDE the pill at its right end, inline with the bar. */}
              <div className="relative w-full h-5 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/10 overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                {/* Colored fill */}
                <div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 transition-all duration-500 ease-out shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                  style={{ width: `${progressPercent}%` }}
                />
                {/* % text — floats above fill, right-aligned inside pill */}
                <span className="absolute inset-0 flex items-center justify-end pr-2.5 text-pink-300 font-bold text-[10px] leading-none z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {progressPercent}%
                </span>
              </div>
            </div>

            {/* Comparison Cards with Glassmorphism & VS badge */}
            <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-stretch justify-center">

              {/* ─── OPTION A / LEFT CARD ─── */}
              {(() => {
                const isSelected = isSurvivor
                  ? selectedSide === 'optionA'
                  : selectedOption === 'optionA'
                const isOtherSelected = isSurvivor
                  ? selectedSide === 'optionB'
                  : selectedOption === 'optionB'

                const label = isSurvivor ? leftItem?.name : currentQuestion?.optionA
                const imageSrc = isSurvivor ? leftItem?.image : currentQuestion?.optionAImage
                const isVideo = !isSurvivor && currentQuestion?.optionAType === 'video'

                return (
                  <button
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => {
                      if (isSurvivor) {
                        handleSelectSurvivor('optionA')
                      } else {
                        handleSelectClassic('optionA')
                      }
                    }}
                    className={`group relative flex flex-col text-left rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 ease-out cursor-pointer focus:outline-none ${
                      isSelected
                        ? 'scale-[0.98] border-cyan-400 ring-4 ring-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.6)] bg-cyan-950/60'
                        : isOtherSelected
                        ? 'opacity-30 scale-95 grayscale-[40%] bg-[#121422]/60 border-white/5'
                        : 'bg-[#121422]/85 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:scale-[1.01] hover:border-cyan-400/70 hover:shadow-[0_20px_50px_rgba(6,182,212,0.35)] hover:bg-[#16192c]/90 active:scale-95'
                    }`}
                  >
                    {/* Card Top Media Container */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center p-3 border-b border-white/10">
                      {isVideo ? (
                        <video
                          key={imageSrc}
                          src={imageSrc}
                          autoPlay
                          muted
                          playsInline
                          controls
                          disablePictureInPicture
                          disableRemotePlayback
                          controlsList="nofullscreen noremoteplayback"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-full object-contain bg-black rounded-2xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                        />
                      ) : (
                        <img
                          key={imageSrc}
                          src={imageSrc}
                          alt={label}
                          className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    {/* Card Bottom Label */}
                    <div className="p-5 sm:p-7 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0a0b12]/50">
                      <p
                        key={label}
                        className="card-label font-['Outfit',sans-serif] text-lg sm:text-xl md:text-2xl font-bold text-center leading-relaxed tracking-wide group-hover:text-cyan-200 transition-colors"
                        style={{
                          color: 'white',
                          textShadow: '0 0 18px rgba(6,182,212,0.55), 0 2px 8px rgba(0,0,0,0.7)',
                          animationDelay: '80ms',
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  </button>
                )
              })()}

              {/* Floating VS Badge (Desktop Center) */}
              <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none items-center justify-center">
                <div className="w-13 h-13 rounded-full bg-[#121422]/95 backdrop-blur-xl border border-white/20 shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center ring-4 ring-slate-900">
                  <span className="font-['Outfit',sans-serif] text-xs font-black tracking-widest bg-gradient-to-br from-cyan-300 via-teal-200 to-pink-400 bg-clip-text text-transparent">
                    VS
                  </span>
                </div>
              </div>

              {/* Mobile VS Badge (In-between divider) */}
              <div className="flex md:hidden items-center justify-center -my-2.5 z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#121422]/95 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center ring-2 ring-slate-900">
                  <span className="font-['Outfit',sans-serif] text-[10px] font-black tracking-widest bg-gradient-to-br from-cyan-300 via-teal-200 to-pink-400 bg-clip-text text-transparent">
                    VS
                  </span>
                </div>
              </div>

              {/* ─── OPTION B / RIGHT CARD ─── */}
              {(() => {
                const isSelected = isSurvivor
                  ? selectedSide === 'optionB'
                  : selectedOption === 'optionB'
                const isOtherSelected = isSurvivor
                  ? selectedSide === 'optionA'
                  : selectedOption === 'optionA'

                const label = isSurvivor ? rightItem?.name : currentQuestion?.optionB
                const imageSrc = isSurvivor ? rightItem?.image : currentQuestion?.optionBImage
                const isVideo = !isSurvivor && currentQuestion?.optionBType === 'video'

                return (
                  <button
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => {
                      if (isSurvivor) {
                        handleSelectSurvivor('optionB')
                      } else {
                        handleSelectClassic('optionB')
                      }
                    }}
                    className={`group relative flex flex-col text-left rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 ease-out cursor-pointer focus:outline-none ${
                      isSelected
                        ? 'scale-[0.98] border-pink-400 ring-4 ring-pink-500/60 shadow-[0_0_40px_rgba(244,63,94,0.6)] bg-pink-950/60'
                        : isOtherSelected
                        ? 'opacity-30 scale-95 grayscale-[40%] bg-[#121422]/60 border-white/5'
                        : 'bg-[#121422]/85 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:scale-[1.01] hover:border-pink-400/70 hover:shadow-[0_20px_50px_rgba(244,63,94,0.35)] hover:bg-[#16192c]/90 active:scale-95'
                    }`}
                  >
                    {/* Card Top Media Container */}
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center p-3 border-b border-white/10">
                      {isVideo ? (
                        <video
                          key={imageSrc}
                          src={imageSrc}
                          autoPlay
                          muted
                          playsInline
                          controls
                          disablePictureInPicture
                          disableRemotePlayback
                          controlsList="nofullscreen noremoteplayback"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full h-full object-contain bg-black rounded-2xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                        />
                      ) : (
                        <img
                          key={imageSrc}
                          src={imageSrc}
                          alt={label}
                          className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                    </div>
                    {/* Card Bottom Label */}
                    <div className="p-5 sm:p-7 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0a0b12]/50">
                      <p
                        key={label}
                        className="card-label font-['Outfit',sans-serif] text-lg sm:text-xl md:text-2xl font-bold text-center leading-relaxed tracking-wide group-hover:text-pink-200 transition-colors"
                        style={{
                          color: 'white',
                          textShadow: '0 0 18px rgba(236,72,153,0.55), 0 2px 8px rgba(0,0,0,0.7)',
                          animationDelay: '80ms',
                        }}
                      >
                        {label}
                      </p>
                    </div>
                  </button>
                )
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
