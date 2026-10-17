import { useState, useRef, useEffect } from 'react'
import { questions } from '../data/questions'
import YouTubeEmbed from './YouTubeEmbed'
import clickSoundUrl from '../assets/click.wav'
import endSoundUrl from '../assets/end.mp3'

// ── Audio effects — instantiated once and reused ──
const clickAudio = typeof Audio !== 'undefined' ? new Audio(clickSoundUrl) : null
const endAudio = typeof Audio !== 'undefined' ? new Audio(endSoundUrl) : null

const STORAGE_KEY_MUTED = 'swipegame_click_sound_muted'

function getInitialMutedState() {
  try {
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true'
  } catch {
    return false
  }
}

function playClickSound(isMuted = false) {
  if (isMuted || !clickAudio) return
  try {
    clickAudio.currentTime = 0
    const playPromise = clickAudio.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {})
    }
  } catch {
    // Autoplay or audio error ignored
  }
}

function playEndSound(isMuted = false) {
  if (isMuted || !endAudio) return
  try {
    endAudio.currentTime = 0
    const playPromise = endAudio.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {})
    }
  } catch {
    // Autoplay or audio error ignored
  }
}

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
  '#fbbf24', '#f59e0b', '#fde68a',   // gold
  '#22d3ee', '#06b6d4', '#67e8f9',   // cyan
  '#f472b6', '#ec4899', '#f9a8d4',   // pink
  '#a78bfa', '#8b5cf6', '#c4b5fd',   // purple
  '#34d399', '#6ee7b7',              // teal
]
function launchConfetti(count = 140) {
  // Two waves: left-side burst and right-side burst
  const spawnWave = (startX, spreadX, delay) => {
    const waveCount = Math.floor(count / 2)
    for (let i = 0; i < waveCount; i++) {
      const el = document.createElement('div')
      el.className = 'confetti-particle'
      const size = 8 + Math.random() * 10
      const isCircle = Math.random() > 0.45
      const dur = 2.2 + Math.random() * 1.8
      const del = delay + Math.random() * 0.5
      el.style.cssText = [
        `width:${size}px`,
        `height:${isCircle ? size : size * 2.4}px`,
        `left:${startX + Math.random() * spreadX}vw`,
        `background:${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]}`,
        `animation-duration:${dur}s`,
        `animation-delay:${del}s`,
        `border-radius:${isCircle ? '50%' : '3px'}`,
        'opacity:1',
      ].join(';')
      document.body.appendChild(el)
      setTimeout(() => el.remove(), (dur + del) * 1000 + 300)
    }
  }
  spawnWave(0, 20, 0)       // left side, immediate
  spawnWave(80, 20, 0)      // right side, immediate
  spawnWave(5, 15, 0.6)     // left, slight delay
  spawnWave(78, 17, 0.6)    // right, slight delay
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

  // ── Audio mute toggle state (persisted in localStorage) ──
  const [isMuted, setIsMuted] = useState(getInitialMutedState)
  const isMutedRef = useRef(isMuted)
  isMutedRef.current = isMuted

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev
      isMutedRef.current = next
      try {
        localStorage.setItem(STORAGE_KEY_MUTED, String(next))
      } catch {
        // ignore storage error
      }
      return next
    })
  }

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
  const [shareLinkLabel, setShareLinkLabel] = useState('Share')

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
      playEndSound(isMutedRef.current)
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
    playClickSound(isMutedRef.current)
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
    playClickSound(isMutedRef.current)
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

  const handleShareLink = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({ title: 'SwipeGame', url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
        .then(() => { setShareLinkLabel('Link copied! ✓'); setTimeout(() => setShareLinkLabel('Share'), 2500) })
        .catch(() => { setShareLinkLabel('Copy failed'); setTimeout(() => setShareLinkLabel('Share'), 2000) })
    }
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
      {/* ── Fixed Mute / Unmute Button (Active only during in-progress questions) ── */}
      {!isCompleted && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          className="fixed top-4 right-14 sm:top-5 sm:right-[4.25rem] z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/20 hover:border-cyan-400/80 backdrop-blur-xl shadow-[0_4px_16px_rgba(0,0,0,0.5)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 cursor-pointer group"
        >
          {isMuted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400 group-hover:text-rose-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 9.75L21.75 14.25m0-4.5L17.25 14.25M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-200 group-hover:text-cyan-300 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.757 3.63 8.25 4.51 8.25H6.75z"
              />
            </svg>
          )}
        </button>
      )}
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

          <h1 className="font-baloo font-['Baloo_2',sans-serif] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
            SwipeGame
          </h1>
          {!(isCompleted && isSurvivor) && (
            <p className="mt-2 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
              {isSurvivor
                ? 'Survivor Bracket: Winner stays, loser gets replaced!'
                : 'This or That? Pick your ultimate favorite!'}
            </p>
          )}
        </header>

        {isCompleted ? (
          /* ════════════ GAME COMPLETED / CHAMPION STATE ════════════ */
          isSurvivor && champion ? (
            /* ─── SURVIVOR CHAMPION DISPLAY ─── */
            <div
              className="w-full max-w-xl text-center"
              style={{ animation: 'modal-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
              {/* Radial spotlight glow behind card */}
              <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
                <div style={{
                  width: '520px',
                  height: '520px',
                  background: 'radial-gradient(ellipse at center, rgba(251,191,36,0.18) 0%, rgba(236,72,153,0.10) 45%, transparent 70%)',
                  borderRadius: '50%',
                  filter: 'blur(30px)',
                }} />
              </div>

              {/* Rich glass card */}
              <div className="relative z-10 bg-gradient-to-br from-[#1a1c3d]/95 via-[#1e1040]/95 to-[#251025]/95 backdrop-blur-2xl border border-amber-400/35 rounded-3xl px-6 py-6 sm:px-8 sm:py-8 shadow-[0_24px_70px_rgba(0,0,0,0.7),0_0_60px_rgba(251,191,36,0.18)] ring-1 ring-amber-400/10">

                {/* Crown */}
                <div
                  className="text-6xl sm:text-7xl mb-2 select-none"
                  style={{ animation: 'crown-drop 0.6s cubic-bezier(0.34,1.56,0.64,1) both, crown-float 3s ease-in-out 0.7s infinite' }}
                >
                  👑
                </div>

                {/* ULTIMATE CHAMPION badge */}
                <div
                  className="relative inline-block overflow-hidden px-5 py-1.5 rounded-full border border-amber-400/50 mb-3"
                  style={{ background: 'linear-gradient(90deg, rgba(251,191,36,0.25), rgba(245,158,11,0.30), rgba(251,191,36,0.25))' }}
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 pointer-events-none" style={{ animation: 'shimmer-sweep 2.4s linear 0.8s infinite', background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)', backgroundSize: '200% 100%' }} />
                  <span className="relative text-[11px] sm:text-xs font-black tracking-widest uppercase" style={{ background: 'linear-gradient(90deg,#fde68a,#fbbf24,#f59e0b,#fde68a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Ultimate Champion
                  </span>
                </div>

                {/* Champion name */}
                <h2
                  className="font-baloo font-['Baloo_2',sans-serif] text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4"
                  style={{ background: 'linear-gradient(135deg,#fde68a 0%,#fbbf24 40%,#ffffff 70%,#fde68a 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                >
                  {champion.name}
                </h2>

                {/* Champion image — no letterbox, blurred bg fill */}
                <div
                  className="relative w-full max-w-xs mx-auto rounded-2xl overflow-hidden mb-4"
                  style={{
                    border: '2px solid rgba(251,191,36,0.55)',
                    boxShadow: '0 0 0 4px rgba(251,191,36,0.12), 0 0 50px rgba(251,191,36,0.35)',
                    animation: 'modal-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.15s both',
                  }}
                >
                  {/* Blurred background fill */}
                  <img
                    src={champion.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110"
                    style={{ filter: 'blur(14px) brightness(0.55)', transform: 'scale(1.15)' }}
                  />
                  {/* Foreground image — natural aspect ratio */}
                  <img
                    src={champion.image}
                    alt={champion.name}
                    className="relative w-full h-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.7)]"
                  />
                </div>

                {/* Stat line */}
                <p className="text-slate-300/85 text-sm sm:text-base mb-5 font-medium">
                  Crowned champion out of{' '}
                  <span className="text-amber-300 font-bold">{survivorPool.length} contenders</span>
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/5 border border-amber-400/15 rounded-2xl p-3 backdrop-blur-md">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-300/70 mb-0.5">Total time</p>
                    <p className="text-xl font-extrabold text-white">{formatTime(elapsedSecs)}</p>
                  </div>
                  <div className="bg-white/5 border border-amber-400/15 rounded-2xl p-3 backdrop-blur-md">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-amber-300/70 mb-0.5">Face-offs</p>
                    <p className="text-xl font-extrabold text-white">{totalBattles}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {/* Play Again — primary */}
                  <button
                    onClick={handleRestart}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white rounded-2xl cursor-pointer bg-indigo-600 border border-indigo-400/30 shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.45)] active:scale-95 active:translate-y-0 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Play Again</span>
                  </button>

                  {/* Choose Another Mode */}
                  {onBackToCategories && (
                    <button
                      onClick={onBackToCategories}
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-amber-400/40 hover:text-white hover:shadow-[0_8px_30px_rgba(251,191,36,0.2)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </button>
                  )}

                  {/* Share link */}
                  <button
                    onClick={handleShareLink}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-white/35 hover:text-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{shareLinkLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── CLASSIC / "You're all done" DISPLAY ─── */
            <div
              className="w-full max-w-lg text-center"
              style={{ animation: 'fade-slide-up 0.55s ease both' }}
            >
              <div className="bg-white/5 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-10 shadow-[0_24px_70px_rgba(0,0,0,0.75)] ring-1 ring-white/5">
                <div className="icon-pop glow-pulse w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center bg-gradient-to-tr from-cyan-500/25 to-pink-500/25 border border-white/20 text-cyan-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="font-baloo font-['Baloo_2',sans-serif] text-4xl sm:text-5xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent mb-3">
                  You're all done!
                </h2>
                <p className="text-slate-300/80 text-sm sm:text-base mb-6">
                  You powered through all <span className="text-pink-400 font-bold">{shuffledQuestions.length}</span> {shuffledQuestions.length === 1 ? 'comparison' : 'comparisons'}. Impressive!
                </p>

                {/* Stats row */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-xs font-semibold tracking-widest uppercase text-cyan-300/80 mb-1">Total time</p>
                    <p className="text-2xl font-extrabold text-white">{formatTime(elapsedSecs)}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                    <p className="text-xs font-semibold tracking-widest uppercase text-pink-300/80 mb-1">Fastest pick</p>
                    <p className="text-2xl font-extrabold text-white">{fastestIdx !== null ? `Q${fastestIdx + 1}` : '—'}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleRestart}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-white rounded-2xl cursor-pointer bg-gradient-to-r from-cyan-500 via-teal-500 to-pink-500 border border-white/20 shadow-[0_6px_25px_rgba(6,182,212,0.4)] hover:shadow-[0_10px_40px_rgba(236,72,153,0.65)] hover:scale-[1.05] hover:brightness-110 active:scale-95 transition-all duration-200"
                  >
                    <span>Play Again</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>

                  {onBackToCategories && (
                    <button
                      onClick={onBackToCategories}
                      className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-cyan-400/40 hover:text-white hover:shadow-[0_8px_30px_rgba(6,182,212,0.2)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Choose Another Mode</span>
                    </button>
                  )}

                  <button
                    onClick={handleShare}
                    className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold rounded-2xl cursor-pointer bg-white/8 backdrop-blur-md border border-white/20 text-slate-200 hover:bg-white/15 hover:border-white/35 hover:text-white hover:shadow-[0_8px_30px_rgba(255,255,255,0.12)] hover:scale-[1.03] active:scale-95 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>{shareLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          )
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
                const isYoutube = !isSurvivor && currentQuestion?.optionAType === 'youtube'
                const isShorts = currentQuestion?.optionAAspectRatio === '9/16' || currentQuestion?.optionAIsShorts
                const hideTitleCover = Boolean(currentQuestion?.optionAHideTitleCover)
                const fillContainer = Boolean(currentQuestion?.optionAFillContainer)

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
                    <div className={`relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center border-b border-white/10 ${
                      isYoutube && fillContainer ? 'p-0' : 'p-3'
                    }`}>
                      {isYoutube ? (
                        <YouTubeEmbed
                          key={`${currentQuestion?.id}-optionA`}
                          url={imageSrc}
                          label={label}
                          isShorts={isShorts}
                          hideTitleCover={hideTitleCover}
                          startTime={currentQuestion?.optionAStart}
                          endTime={currentQuestion?.optionAEnd}
                          segments={currentQuestion?.optionASegments}
                          questionId={currentQuestion?.id}
                          optionKey="optionA"
                          fillContainer={fillContainer}
                        />
                      ) : isVideo ? (
                        <>
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
                            className="w-full h-full object-contain bg-black rounded-2xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                          />
                          {/* Transparent overlay covers the upper ~80% of the video so clicking the
                              video area selects the card, while the bottom strip (native controls)
                              is left uncovered so play/pause/volume controls work normally. */}
                          <div
                            className="absolute inset-0 cursor-pointer"
                            style={{ bottom: '20%' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isTransitioning) {
                                if (isSurvivor) handleSelectSurvivor('optionA')
                                else handleSelectClassic('optionA')
                              }
                            }}
                            aria-hidden="true"
                          />
                        </>
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
                        className="card-label font-baloo font-['Baloo_2',sans-serif] text-lg sm:text-xl md:text-2xl font-bold text-center leading-snug tracking-normal group-hover:text-cyan-200 transition-colors"
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
                  <span className="text-xs font-black tracking-widest bg-gradient-to-br from-cyan-300 via-teal-200 to-pink-400 bg-clip-text text-transparent">
                    VS
                  </span>
                </div>
              </div>

              {/* Mobile VS Badge (In-between divider) */}
              <div className="flex md:hidden items-center justify-center -my-2.5 z-20 pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#121422]/95 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center justify-center ring-2 ring-slate-900">
                  <span className="text-[10px] font-black tracking-widest bg-gradient-to-br from-cyan-300 via-teal-200 to-pink-400 bg-clip-text text-transparent">
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
                const isYoutube = !isSurvivor && currentQuestion?.optionBType === 'youtube'
                const isShorts = currentQuestion?.optionBAspectRatio === '9/16' || currentQuestion?.optionBIsShorts
                const hideTitleCover = Boolean(currentQuestion?.optionBHideTitleCover)
                const fillContainer = Boolean(currentQuestion?.optionBFillContainer)

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
                    <div className={`relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center border-b border-white/10 ${
                      isYoutube && fillContainer ? 'p-0' : 'p-3'
                    }`}>
                      {isYoutube ? (
                        <YouTubeEmbed
                          key={`${currentQuestion?.id}-optionB`}
                          url={imageSrc}
                          label={label}
                          isShorts={isShorts}
                          hideTitleCover={hideTitleCover}
                          startTime={currentQuestion?.optionBStart}
                          endTime={currentQuestion?.optionBEnd}
                          segments={currentQuestion?.optionBSegments}
                          questionId={currentQuestion?.id}
                          optionKey="optionB"
                          fillContainer={fillContainer}
                        />
                      ) : isVideo ? (
                        <>
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
                            className="w-full h-full object-contain bg-black rounded-2xl drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
                          />
                          {/* Transparent overlay covers the upper ~80% of the video so clicking the
                              video area selects the card, while the bottom strip (native controls)
                              is left uncovered so play/pause/volume controls work normally. */}
                          <div
                            className="absolute inset-0 cursor-pointer"
                            style={{ bottom: '20%' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isTransitioning) {
                                if (isSurvivor) handleSelectSurvivor('optionB')
                                else handleSelectClassic('optionB')
                              }
                            }}
                            aria-hidden="true"
                          />
                        </>
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
                        className="card-label font-baloo font-['Baloo_2',sans-serif] text-lg sm:text-xl md:text-2xl font-bold text-center leading-snug tracking-normal group-hover:text-pink-200 transition-colors"
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
