import { useState } from 'react'
import { questions } from '../data/questions'

export default function ComparisonScreen() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const isCompleted = currentIndex >= questions.length
  const currentQuestion = questions[currentIndex]

  const handleSelectOption = (optionKey, optionText) => {
    if (isTransitioning) return

    setSelectedOption(optionKey)
    setIsTransitioning(true)

    console.log(`Question ID: ${currentQuestion.id} | Selected: ${optionKey} ("${optionText}")`)

    setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1)
      setSelectedOption(null)
      setIsTransitioning(false)
    }, 320)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsTransitioning(false)
  }

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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 mb-3 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-cyan-200">
              Interactive Choice Game
            </span>
          </div>

          <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
            SwipeGame
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
            This or That? Pick your ultimate favorite!
          </p>
        </header>

        {isCompleted ? (
          /* Game Completed State */
          <div className="w-full max-w-lg bg-[#111320]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-8 sm:p-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 text-cyan-300 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-10 h-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">
              You're all done!
            </h2>
            <p className="text-slate-300/80 text-sm sm:text-base mb-8">
              You evaluated all <span className="text-pink-400 font-bold">{questions.length}</span> comparisons.
            </p>

            <button
              onClick={handleRestart}
              className="group font-['Outfit',sans-serif] inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-teal-500 to-pink-500 rounded-2xl shadow-[0_6px_25px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_35px_rgba(236,72,153,0.6)] hover:scale-105 hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
            >
              <span>Play Again</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        ) : (
          /* Active Comparison Screen */
          <div className="w-full flex flex-col items-center">
            {/* Progress indicator */}
            <div className="w-full max-w-md mb-6 sm:mb-8 flex flex-col items-center px-2">
              <div className="flex justify-between w-full text-xs font-semibold tracking-wider text-slate-300 mb-2.5">
                <span className="flex items-center gap-1.5 text-cyan-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Question <span className="text-white font-bold">{currentIndex + 1}</span> of {questions.length}
                </span>
                <span className="text-pink-400 font-bold tracking-normal">
                  {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-950/90 backdrop-blur-md rounded-full h-3 overflow-hidden border border-white/10 p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div
                  className="bg-gradient-to-r from-cyan-400 via-teal-400 to-pink-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_14px_rgba(34,211,238,0.7)]"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Comparison Cards with Glassmorphism & VS badge */}
            <div className="relative w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 items-stretch justify-center">
              {/* Option A Card */}
              <button
                type="button"
                disabled={isTransitioning}
                onClick={() => handleSelectOption('optionA', currentQuestion.optionA)}
                className={`group relative flex flex-col text-left rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 ease-out cursor-pointer focus:outline-none ${
                  selectedOption === 'optionA'
                    ? 'scale-[0.98] border-cyan-400 ring-4 ring-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.6)] bg-cyan-950/60'
                    : selectedOption === 'optionB'
                    ? 'opacity-30 scale-95 grayscale-[40%] bg-[#121422]/60 border-white/5'
                    : 'bg-[#121422]/85 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:scale-[1.01] hover:border-cyan-400/70 hover:shadow-[0_20px_50px_rgba(6,182,212,0.35)] hover:bg-[#16192c]/90 active:scale-95'
                }`}
              >
                {/* Card Top Image Container */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center p-3 border-b border-white/10">
                  <img
                    src={currentQuestion.optionAImage}
                    alt={currentQuestion.optionA}
                    className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Card Bottom Label */}
                <div className="p-5 sm:p-7 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0a0b12]/50">
                  <p className="font-['Outfit',sans-serif] text-base sm:text-lg md:text-xl font-bold text-white text-center leading-snug group-hover:text-cyan-200 transition-colors">
                    {currentQuestion.optionA}
                  </p>
                </div>
              </button>

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

              {/* Option B Card */}
              <button
                type="button"
                disabled={isTransitioning}
                onClick={() => handleSelectOption('optionB', currentQuestion.optionB)}
                className={`group relative flex flex-col text-left rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 ease-out cursor-pointer focus:outline-none ${
                  selectedOption === 'optionB'
                    ? 'scale-[0.98] border-pink-400 ring-4 ring-pink-500/60 shadow-[0_0_40px_rgba(244,63,94,0.6)] bg-pink-950/60'
                    : selectedOption === 'optionA'
                    ? 'opacity-30 scale-95 grayscale-[40%] bg-[#121422]/60 border-white/5'
                    : 'bg-[#121422]/85 border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.5)] hover:-translate-y-2 hover:scale-[1.01] hover:border-pink-400/70 hover:shadow-[0_20px_50px_rgba(244,63,94,0.35)] hover:bg-[#16192c]/90 active:scale-95'
                }`}
              >
                {/* Card Top Image Container */}
                <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#0a0b12]/90 backdrop-blur-sm flex items-center justify-center p-3 border-b border-white/10">
                  <img
                    src={currentQuestion.optionBImage}
                    alt={currentQuestion.optionB}
                    className="w-full h-full object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                {/* Card Bottom Label */}
                <div className="p-5 sm:p-7 flex-1 flex items-center justify-center bg-gradient-to-b from-transparent to-[#0a0b12]/50">
                  <p className="font-['Outfit',sans-serif] text-base sm:text-lg md:text-xl font-bold text-white text-center leading-snug group-hover:text-pink-200 transition-colors">
                    {currentQuestion.optionB}
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
