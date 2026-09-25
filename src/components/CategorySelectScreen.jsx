import React, { useState } from 'react'
import { questions } from '../data/questions'
import { actressAllQuestions } from '../data/actressAllQuestions'
import { actressHollywoodQuestions } from '../data/actressHollywoodQuestions'
import { actressBollywoodQuestions } from '../data/actressBollywoodQuestions'
import { actorQuestions } from '../data/actorQuestions'
import { carsQuestions } from '../data/carsQuestions'

import bgEverything from '../assets/image copy 141.png'
import bgActress from '../assets/image copy 70.png'
import bgActor from '../assets/image copy 81.png'
import bgCars from '../assets/image copy 14.png'
import bgActressAll from '../assets/image copy 56.png'
import bgActressBollywood from '../assets/image copy 208.png'

// ─── Main category definitions ────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: 'all',
    title: 'Everything',
    subtitle: 'All questions mixed in random order',
    badge: 'ALL-IN-ONE',
    color: 'from-cyan-400 via-teal-300 to-cyan-500',
    borderGlow: 'hover:border-cyan-400/90 hover:shadow-[0_0_45px_rgba(6,182,212,0.45)]',
    badgeColor: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.35)]',
    overlayGradient: 'from-cyan-950/40 to-teal-950/40',
    iconBg: 'bg-cyan-500/15 border-cyan-400/30 text-cyan-300',
    bgImage: bgEverything,
    hasSubMenu: false,
    isSurvivor: false,
    getQuestions: () => questions.filter((q) => !q.excludeFromEverything),
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: 'actress',
    title: 'Face Off: Female',
    subtitle: "Who's the most drop-dead gorgeous?",
    badge: 'CELEBRITY',
    color: 'from-pink-400 via-rose-300 to-pink-500',
    borderGlow: 'hover:border-pink-400/90 hover:shadow-[0_0_45px_rgba(244,63,94,0.45)]',
    badgeColor: 'bg-pink-500/25 text-pink-200 border-pink-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    overlayGradient: 'from-pink-950/40 to-rose-950/40',
    iconBg: 'bg-pink-500/15 border-pink-400/30 text-pink-300',
    bgImage: bgActress,
    hasSubMenu: true,
    isSurvivor: true,
    countLabel: '3 categories',
    getQuestions: () => actressAllQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'actor',
    title: 'Face Off: Male',
    subtitle: "Hollywood, Bollywood, and beyond — one ultimate showdown",
    badge: 'CELEBRITY',
    color: 'from-purple-400 via-violet-300 to-purple-500',
    borderGlow: 'hover:border-purple-400/90 hover:shadow-[0_0_45px_rgba(168,85,247,0.45)]',
    badgeColor: 'bg-purple-500/25 text-purple-200 border-purple-400/40 shadow-[0_0_15px_rgba(168,85,247,0.35)]',
    overlayGradient: 'from-purple-950/40 to-indigo-950/40',
    iconBg: 'bg-purple-500/15 border-purple-400/30 text-purple-300',
    bgImage: bgActor,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => actorQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    id: 'cars',
    title: 'Face Off: Cars',
    subtitle: 'Which car turns more heads?',
    badge: 'Cars',
    color: 'from-amber-400 via-orange-300 to-amber-500',
    borderGlow: 'hover:border-amber-400/90 hover:shadow-[0_0_45px_rgba(251,191,36,0.45)]',
    badgeColor: 'bg-amber-500/25 text-amber-200 border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.35)]',
    overlayGradient: 'from-amber-950/40 to-orange-950/40',
    iconBg: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    bgImage: bgCars,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => carsQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
]

// ─── Actress sub-categories ────────────────────────────────────────────────────
const ACTRESS_SUBCATEGORIES = [
  {
    id: 'actress-all',
    title: 'All',
    subtitle: 'Hollywood meets Bollywood, one ultimate showdown',
    color: 'from-pink-400 via-rose-300 to-fuchsia-400',
    borderGlow: 'hover:border-pink-400/90 hover:shadow-[0_0_45px_rgba(244,63,94,0.5)]',
    badgeColor: 'bg-pink-500/25 text-pink-200 border-pink-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    overlayGradient: 'from-pink-950/40 to-fuchsia-950/40',
    iconBg: 'bg-pink-500/15 border-pink-400/30 text-pink-300',
    bgImage: bgActressAll,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => actressAllQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: 'actress-hollywood',
    title: 'Hollywood',
    subtitle: "Hollywood's most unforgettable faces",
    badge: 'HOLLYWOOD',
    color: 'from-yellow-400 via-amber-300 to-orange-400',
    borderGlow: 'hover:border-yellow-400/90 hover:shadow-[0_0_45px_rgba(250,204,21,0.5)]',
    badgeColor: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.35)]',
    overlayGradient: 'from-yellow-950/40 to-amber-950/40',
    iconBg: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    bgImage: bgActress,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => actressHollywoodQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'actress-bollywood',
    title: 'Bollywood',
    subtitle: 'The queens of Indian cinema go head-to-head',
    badge: 'BOLLYWOOD',
    color: 'from-rose-500 via-pink-400 to-red-400',
    borderGlow: 'hover:border-rose-400/90 hover:shadow-[0_0_45px_rgba(244,63,94,0.5)]',
    badgeColor: 'bg-rose-500/25 text-rose-200 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    overlayGradient: 'from-rose-950/40 to-red-950/40',
    iconBg: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
    bgImage: bgActressBollywood,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => actressBollywoodQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
]

// ─── Shared background ─────────────────────────────────────────────────────────
function ScreenBackground() {
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

// ─── Reusable Category Card ────────────────────────────────────────────────────
function CategoryCard({ cat, onClick }) {
  const count = cat.getQuestions().length
  const countDisplay = cat.countLabel ?? (count === 0 ? 'Coming soon' : `${count} ${count === 1 ? 'choice' : 'choices'}`)
  return (
    <button
      type="button"
      onClick={() => onClick(cat)}
      className={`group relative text-left bg-[#0c0e18]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] ${cat.borderGlow} hover:-translate-y-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[220px] sm:min-h-[240px]`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950">
        <img
          src={cat.bgImage}
          alt={cat.title}
          className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-95 group-hover:scale-108 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12]/90 via-[#0a0b12]/45 to-[#0a0b12]/35" />
        <div className={`absolute inset-0 bg-gradient-to-br ${cat.overlayGradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
      </div>

      {/* Shimmer sweep */}
      <div className="card-shimmer pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

      {/* Top accent border */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.color} opacity-85 group-hover:opacity-100 transition-opacity shadow-[0_0_12px_rgba(255,255,255,0.25)] z-20`} />

      {/* Content */}
      <div className="relative z-20">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center backdrop-blur-md ${cat.iconBg} group-hover:scale-110 transition-transform duration-300 shadow-md`}>
            {cat.icon}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full border ${cat.badgeColor}`}>
              {cat.badge}
            </span>
            <span className="text-xs font-bold text-slate-300 bg-slate-950/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md shadow-inner">
              {countDisplay}
            </span>
          </div>
        </div>

        <h2
          className="font-['Outfit',sans-serif] text-2xl sm:text-3xl font-black text-white group-hover:text-cyan-200 transition-colors mb-2"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
        >
          {cat.title}
        </h2>
        <p
          className="text-slate-200/90 text-xs sm:text-sm leading-relaxed font-medium"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
        >
          {cat.subtitle}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-20 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
        <span className="group-hover:translate-x-1 transition-transform tracking-wide">
          {cat.hasSubMenu ? 'Choose Sub-Category' : 'Start Playing'}
        </span>
        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-cyan-500/25 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CategorySelectScreen({ onSelectCategory }) {
  const [showActressSubMenu, setShowActressSubMenu] = useState(false)

  function handleCategoryClick(cat) {
    if (cat.hasSubMenu) {
      setShowActressSubMenu(true)
    } else {
      onSelectCategory({
        id: cat.id,
        title: cat.title,
        getQuestions: cat.getQuestions,
        isSurvivor: cat.isSurvivor ?? false,
      })
    }
  }

  function handleSubCategoryClick(sub) {
    onSelectCategory({
      id: sub.id,
      title: sub.title,
      getQuestions: sub.getQuestions,
      isSurvivor: sub.isSurvivor ?? true,
    })
  }

  // ── Actress sub-selection screen ───────────────────────────────────────────
  if (showActressSubMenu) {
    return (
      <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center px-2 sm:px-4 py-8 sm:py-12 overflow-x-hidden selection:bg-pink-500 selection:text-white">
        <ScreenBackground />

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          {/* Back button */}
          <button
            type="button"
            onClick={() => setShowActressSubMenu(false)}
            className="self-start mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-pink-400/70 text-white text-sm font-bold shadow-[0_0_18px_rgba(244,63,94,0.45)] hover:bg-slate-800 hover:border-pink-400 hover:shadow-[0_0_28px_rgba(244,63,94,0.65)] hover:-translate-x-1 active:scale-95 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Header */}
          <header className="text-center mb-8 sm:mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 mb-3 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-pink-200">
                Face Off: Female
              </span>
            </div>

            <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(244,63,94,0.3)]">
              Choose Your Category
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
              Pick a sub-category to start the female face-off!
            </p>
          </header>

          {/* Sub-category grid (3 columns) — max-w-5xl + wider gap for more spacious cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {ACTRESS_SUBCATEGORIES.map((sub) => (
              <CategoryCard key={sub.id} cat={sub} onClick={handleSubCategoryClick} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Main category selection screen ─────────────────────────────────────────
  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <ScreenBackground />

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 mb-3 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-cyan-200">
              Interactive Choice Game
            </span>
          </div>

          <h1 className="font-['Outfit',sans-serif] text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
            Choose Your Mode
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
            Pick a category to begin your ultimate comparison showdown!
          </p>
        </header>

        {/* 2x2 Category Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} cat={cat} onClick={handleCategoryClick} />
          ))}
        </div>
      </div>
    </div>
  )
}
