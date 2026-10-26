import { useState, useRef, useCallback, useEffect } from 'react'
import { questions } from '../data/questions'
import { actressAllQuestions } from '../data/actressAllQuestions'
import { actressHollywoodQuestions } from '../data/actressHollywoodQuestions'
import { actressBollywoodQuestions } from '../data/actressBollywoodQuestions'
import { actorQuestions } from '../data/actorQuestions'
import { carsQuestions } from '../data/carsQuestions'
import { foodQuestions } from '../data/foodQuestions'

import bgEverything from '../assets/image copy 141.png'
import bgActress from '../assets/image copy 70.png'
import bgActor from '../assets/image copy 81.png'
import bgCars from '../assets/image copy 14.png'
import bgActressAll from '../assets/image copy 56.png'
import bgActressBollywood from '../assets/image copy 208.png'
import bgFood from '../assets/image copy 458.png'

// Subcategory background images
import bgMexican from '../assets/image copy 2.png'
import bgCanadian from '../assets/image copy 4.png'
import bgJapanKoreanChinese from '../assets/image copy 10.png'
import bgBrazilian from '../assets/image copy 15.png'
import bgItalian from '../assets/image copy 44.png'
import bgTurkish from '../assets/image copy 49.png'
import bgUkrainian from '../assets/image copy 51.png'
import bgRussian from '../assets/image copy 66.png'
import bgAustralian from '../assets/image copy 88.png'
import bgEuropean from '../assets/image copy 101.png'

// Helper: get question objects by IDs from actressAllQuestions
function getByIds(ids) {
  return ids.map((id) => actressAllQuestions.find((q) => q.id === id)).filter(Boolean)
}

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
    countLabel: '12 categories',
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
    subtitle: "Who's got more charm and style? Hollywood, Bollywood, and more",
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
  {
    id: 'food',
    title: 'Face Off: Food',
    subtitle: 'Which dish wins your appetite?',
    badge: 'FOOD',
    color: 'from-green-400 via-emerald-300 to-lime-400',
    borderGlow: 'hover:border-green-400/90 hover:shadow-[0_0_45px_rgba(74,222,128,0.45)]',
    badgeColor: 'bg-green-500/25 text-green-200 border-green-400/40 shadow-[0_0_15px_rgba(74,222,128,0.35)]',
    overlayGradient: 'from-green-950/40 to-emerald-950/40',
    iconBg: 'bg-green-500/15 border-green-400/30 text-green-300',
    bgImage: bgFood,
    hasSubMenu: false,
    isSurvivor: true,
    getQuestions: () => foodQuestions,
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21l-9-14.5a18.2 18.2 0 0118 0L12 21z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.8 9a15.2 15.2 0 0114.4 0" />
        <circle cx="10" cy="13.5" r="1" fill="currentColor" />
        <circle cx="14" cy="12.5" r="1" fill="currentColor" />
        <circle cx="12" cy="16.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
]

// Shared heart icon for subcategory cards
const HeartIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)

// ─── Actress sub-categories (display order as requested) ──────────────────────
const ACTRESS_SUBCATEGORIES = [
  // 1. All / Everything
  {
    id: 'actress-all',
    title: 'All',
    subtitle: 'Hollywood, Bollywood, and Beyond — one ultimate showdown',
    badge: 'ALL',
    color: 'from-pink-400 via-rose-300 to-fuchsia-400',
    borderGlow: 'hover:border-pink-400/90 hover:shadow-[0_0_45px_rgba(244,63,94,0.5)]',
    badgeColor: 'bg-pink-500/25 text-pink-200 border-pink-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    overlayGradient: 'from-pink-950/40 to-fuchsia-950/40',
    iconBg: 'bg-pink-500/15 border-pink-400/30 text-pink-300',
    bgImage: bgActressAll,
    isSurvivor: true,
    getQuestions: () => actressAllQuestions,
    icon: HeartIcon,
  },
  // 2. Canadian — IDs 5 → 6 → 44
  {
    id: 'actress-canadian',
    title: 'Canadian',
    subtitle: 'The finest faces from Canada',
    badge: 'CANADIAN',
    color: 'from-red-400 via-rose-300 to-red-500',
    borderGlow: 'hover:border-red-400/90 hover:shadow-[0_0_45px_rgba(239,68,68,0.5)]',
    badgeColor: 'bg-red-500/25 text-red-200 border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
    overlayGradient: 'from-red-950/40 to-rose-950/40',
    iconBg: 'bg-red-500/15 border-red-400/30 text-red-300',
    bgImage: bgCanadian,
    isSurvivor: true,
    getQuestions: () => getByIds([5, 6, 44]),
    icon: HeartIcon,
  },
  // 3. Italian — IDs 9 → 10 → 61
  {
    id: 'actress-italian',
    title: 'Italian',
    subtitle: 'Italian beauty in a face-off',
    badge: 'ITALIAN',
    color: 'from-green-400 via-slate-100 to-red-400',
    borderGlow: 'hover:border-green-400/90 hover:shadow-[0_0_45px_rgba(74,222,128,0.5)]',
    badgeColor: 'bg-green-500/25 text-green-200 border-green-400/40 shadow-[0_0_15px_rgba(74,222,128,0.35)]',
    overlayGradient: 'from-green-950/40 to-red-950/40',
    iconBg: 'bg-green-500/15 border-green-400/30 text-green-300',
    bgImage: bgItalian,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 4. Indian (Bollywood)
  {
    id: 'actress-bollywood',
    title: 'Indian',
    subtitle: 'The queens of Indian cinema go head-to-head',
    badge: 'INDIAN',
    color: 'from-rose-500 via-pink-400 to-red-400',
    borderGlow: 'hover:border-rose-400/90 hover:shadow-[0_0_45px_rgba(244,63,94,0.5)]',
    badgeColor: 'bg-rose-500/25 text-rose-200 border-rose-400/40 shadow-[0_0_15px_rgba(244,63,94,0.35)]',
    overlayGradient: 'from-rose-950/40 to-red-950/40',
    iconBg: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
    bgImage: bgActressBollywood,
    isSurvivor: true,
    getQuestions: () => actressBollywoodQuestions,
    icon: HeartIcon,
  },
  // 5. Australian — IDs 9 → 10 → 61
  {
    id: 'actress-australian',
    title: 'Australian',
    subtitle: 'Down Under beauties battle it out',
    badge: 'AUSTRALIAN',
    color: 'from-yellow-400 via-amber-300 to-orange-400',
    borderGlow: 'hover:border-yellow-400/90 hover:shadow-[0_0_45px_rgba(250,204,21,0.5)]',
    badgeColor: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.35)]',
    overlayGradient: 'from-yellow-950/40 to-amber-950/40',
    iconBg: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    bgImage: bgAustralian,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 6. Russian — IDs 9 → 10 → 61
  {
    id: 'actress-russian',
    title: 'Russian',
    subtitle: 'Russian elegance meets the arena',
    badge: 'RUSSIAN',
    color: 'from-blue-400 via-slate-100 to-red-400',
    borderGlow: 'hover:border-blue-400/90 hover:shadow-[0_0_45px_rgba(96,165,250,0.5)]',
    badgeColor: 'bg-blue-500/25 text-blue-200 border-blue-400/40 shadow-[0_0_15px_rgba(96,165,250,0.35)]',
    overlayGradient: 'from-blue-950/40 to-red-950/40',
    iconBg: 'bg-blue-500/15 border-blue-400/30 text-blue-300',
    bgImage: bgRussian,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 7. Ukrainian — IDs 9 → 10 → 61
  {
    id: 'actress-ukrainian',
    title: 'Ukrainian',
    subtitle: 'Ukrainian beauties take the stage',
    badge: 'UKRAINIAN',
    color: 'from-sky-400 via-blue-300 to-yellow-400',
    borderGlow: 'hover:border-sky-400/90 hover:shadow-[0_0_45px_rgba(56,189,248,0.5)]',
    badgeColor: 'bg-sky-500/25 text-sky-200 border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    overlayGradient: 'from-sky-950/40 to-yellow-950/40',
    iconBg: 'bg-sky-500/15 border-sky-400/30 text-sky-300',
    bgImage: bgUkrainian,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 8. Turkish — IDs 9 → 10 → 61
  {
    id: 'actress-turkish',
    title: 'Turkish',
    subtitle: 'Turkish allure in the spotlight',
    badge: 'TURKISH',
    color: 'from-red-400 via-rose-300 to-slate-100',
    borderGlow: 'hover:border-red-400/90 hover:shadow-[0_0_45px_rgba(239,68,68,0.5)]',
    badgeColor: 'bg-red-500/25 text-red-200 border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.35)]',
    overlayGradient: 'from-red-950/40 to-pink-950/40',
    iconBg: 'bg-red-500/15 border-red-400/30 text-red-300',
    bgImage: bgTurkish,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 9. Japan / Korean / Chinese — IDs 45 → 7 → 8
  {
    id: 'actress-asian',
    title: 'Japan / Korean / Chinese',
    subtitle: 'East Asian icons go head to head',
    badge: 'ASIAN',
    color: 'from-fuchsia-400 via-purple-300 to-pink-400',
    borderGlow: 'hover:border-fuchsia-400/90 hover:shadow-[0_0_45px_rgba(217,70,239,0.5)]',
    badgeColor: 'bg-fuchsia-500/25 text-fuchsia-200 border-fuchsia-400/40 shadow-[0_0_15px_rgba(217,70,239,0.35)]',
    overlayGradient: 'from-fuchsia-950/40 to-purple-950/40',
    iconBg: 'bg-fuchsia-500/15 border-fuchsia-400/30 text-fuchsia-300',
    bgImage: bgJapanKoreanChinese,
    isSurvivor: true,
    getQuestions: () => getByIds([45, 7, 8]),
    icon: HeartIcon,
  },
  // 10. European — IDs 9 → 10 → 61
  {
    id: 'actress-european',
    title: 'European',
    subtitle: 'European charm in a beauty battle',
    badge: 'EUROPEAN',
    color: 'from-indigo-400 via-blue-300 to-violet-400',
    borderGlow: 'hover:border-indigo-400/90 hover:shadow-[0_0_45px_rgba(129,140,248,0.5)]',
    badgeColor: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/40 shadow-[0_0_15px_rgba(129,140,248,0.35)]',
    overlayGradient: 'from-indigo-950/40 to-blue-950/40',
    iconBg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-300',
    bgImage: bgEuropean,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
  },
  // 11. Mexican — IDs 43 → 2 → 3
  {
    id: 'actress-mexican',
    title: 'Mexican',
    subtitle: 'Mexican fire — who wins the crown?',
    badge: 'MEXICAN',
    color: 'from-green-400 via-slate-100 to-red-400',
    borderGlow: 'hover:border-green-400/90 hover:shadow-[0_0_45px_rgba(74,222,128,0.5)]',
    badgeColor: 'bg-green-500/25 text-green-200 border-green-400/40 shadow-[0_0_15px_rgba(74,222,128,0.35)]',
    overlayGradient: 'from-green-950/40 to-red-950/40',
    iconBg: 'bg-green-500/15 border-green-400/30 text-green-300',
    bgImage: bgMexican,
    isSurvivor: true,
    getQuestions: () => getByIds([43, 2, 3]),
    icon: HeartIcon,
  },
  // 12. Brazilian — IDs 9 → 10 → 61
  {
    id: 'actress-brazilian',
    title: 'Brazilian',
    subtitle: 'Brazilian heat — only one queen survives',
    badge: 'BRAZILIAN',
    color: 'from-yellow-400 via-green-300 to-blue-400',
    borderGlow: 'hover:border-yellow-400/90 hover:shadow-[0_0_45px_rgba(250,204,21,0.5)]',
    badgeColor: 'bg-yellow-500/25 text-yellow-200 border-yellow-400/40 shadow-[0_0_15px_rgba(250,204,21,0.35)]',
    overlayGradient: 'from-yellow-950/40 to-green-950/40',
    iconBg: 'bg-yellow-500/15 border-yellow-400/30 text-yellow-300',
    bgImage: bgBrazilian,
    isSurvivor: true,
    getQuestions: () => getByIds([9, 10, 61]),
    icon: HeartIcon,
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
          className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-200 transition-colors mb-2 tracking-normal leading-snug"
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

const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0))

// ─── Subcategory card matching the large mode-selection card style ────────────
function SubCategoryCard({ cat, onClick }) {
  const count = cat.getQuestions().length
  const countDisplay = count === 0 ? 'Coming soon' : `${count} ${count === 1 ? 'choice' : 'choices'}`
  return (
    <button
      type="button"
      data-card="true"
      onClick={() => onClick(cat)}
      style={{ scrollSnapAlign: isTouchDevice ? 'start' : 'none' }}
      className={`group relative text-left bg-[#0c0e18]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-7 shadow-[0_16px_40px_rgba(0,0,0,0.6)] ${cat.borderGlow} hover:-translate-y-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden flex-shrink-0 w-[calc(100vw-130px)] min-w-[240px] sm:w-[385px] sm:min-w-[385px] min-h-[230px] sm:min-h-[240px]`}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-slate-950 rounded-3xl">
        <img
          src={cat.bgImage}
          alt={cat.title}
          draggable="false"
          className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-95 group-hover:scale-108 transition-all duration-700 ease-out select-none pointer-events-none"
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
          className="font-baloo font-['Baloo_2',sans-serif] text-2xl sm:text-3xl font-bold text-white group-hover:text-cyan-200 transition-colors mb-2 tracking-normal leading-snug line-clamp-1"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
        >
          {cat.title}
        </h2>
        <p
          className="text-slate-200/90 text-xs sm:text-sm leading-relaxed font-medium line-clamp-2"
          style={{ textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}
        >
          {cat.subtitle}
        </p>
      </div>

      {/* Footer */}
      <div className="relative z-20 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
        <span className="group-hover:translate-x-1 transition-transform tracking-wide">
          Start Playing
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

// ─── Arrow scroll button ───────────────────────────────────────────────────────
function ScrollArrow({ direction, disabled, onPointerDown, onPointerUp, onPointerCancel, onPointerLeave }) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onPointerLeave={onPointerLeave}
      style={{ touchAction: 'none' }}
      className={`flex-shrink-0 w-11 h-11 sm:w-13 sm:h-13 rounded-full border backdrop-blur-md flex items-center justify-center transition-all duration-200 select-none z-20 shadow-lg ${
        disabled
          ? 'opacity-20 border-white/5 bg-slate-900/30 text-slate-600 cursor-default pointer-events-none'
          : 'bg-slate-900/90 border-pink-400/50 text-pink-200 hover:bg-pink-500/25 hover:border-pink-400 hover:shadow-[0_0_22px_rgba(244,63,94,0.55)] cursor-pointer active:scale-90'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={direction === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}

// ─── Actress sub-menu with horizontal row + full scroll support ────────────────
function ActressSubMenu({ onBack, onSelect }) {
  const rowRef = useRef(null)
  const rafRef = useRef(null)
  const holdTimerRef = useRef(null)

  // Modes: 'idle' | 'holding' | 'releasing' | 'tapping'
  const animModeRef = useRef('idle')
  const isHoldingActiveRef = useRef(false)
  const pressStartTimeRef = useRef(0)
  const pressDirRef = useRef(0)

  // Hold & release physics
  const holdStartTimeRef = useRef(0)
  const releaseStartTimeRef = useRef(0)
  const releaseInitialSpeedRef = useRef(0)
  const currentSpeedRef = useRef(0)
  const lastTimeRef = useRef(0)

  // Drag-to-scroll state
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartScrollLeftRef = useRef(0)
  const hasDraggedRef = useRef(false)

  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  // Clean arrow state update only when boolean changes (avoids 60fps re-renders)
  const updateArrows = useCallback(() => {
    const el = rowRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    const nextCanLeft = el.scrollLeft > 2
    const nextCanRight = el.scrollLeft < maxScroll - 2

    setCanLeft((prev) => (prev !== nextCanLeft ? nextCanLeft : prev))
    setCanRight((prev) => (prev !== nextCanRight ? nextCanRight : prev))
  }, [])

  // Helper to ensure scroll-snap and smooth scrolling never fight JS animation
  const setRowScrollMode = useCallback((active) => {
    const el = rowRef.current
    if (!el) return
    if (active) {
      el.style.scrollBehavior = 'auto'
      el.style.scrollSnapType = 'none'
    } else {
      el.style.scrollBehavior = 'auto'
      el.style.scrollSnapType = isTouchDevice ? 'x proximity' : 'none'
    }
  }, [])

  // Initial check and listeners
  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    setRowScrollMode(false)
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }, [updateArrows, setRowScrollMode])

  // Mouse wheel and trackpad support
  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return
      }
      if (Math.abs(e.deltaY) > 0) {
        const atLeft = el.scrollLeft <= 0 && e.deltaY < 0
        const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2 && e.deltaY > 0
        if (!atLeft && !atRight) {
          e.preventDefault()
          el.scrollLeft += e.deltaY
          updateArrows()
        }
      }
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [updateArrows])

  // Hold scrolling loop: ~300px/s, 250ms ease-in, gentle boundary damping, 350ms ease-out release
  const startHold = useCallback((dir) => {
    const el = rowRef.current
    if (!el) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    setRowScrollMode(true)
    animModeRef.current = 'holding'
    isHoldingActiveRef.current = true
    holdStartTimeRef.current = performance.now()
    lastTimeRef.current = performance.now()
    currentSpeedRef.current = 0

    const HOLD_SPEED = 300 // px per second
    const EASE_IN_MS = 250 // ease-in over about 250ms

    const loop = (now) => {
      if (!rowRef.current) return
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.05)
      lastTimeRef.current = now

      const el = rowRef.current
      const maxScroll = el.scrollWidth - el.clientWidth

      if (animModeRef.current === 'holding') {
        const elapsed = now - holdStartTimeRef.current
        const progress = Math.min(elapsed / EASE_IN_MS, 1)
        const easeIn = progress * progress
        let targetSpeed = dir * HOLD_SPEED * easeIn

        // End deceleration: slow down with an ease-out when approaching ends
        const dist = dir < 0 ? el.scrollLeft : (maxScroll - el.scrollLeft)
        if (dist < 180) {
          const damping = Math.max(0, dist / 180)
          targetSpeed = targetSpeed * (damping * (2 - damping))
        }

        currentSpeedRef.current = targetSpeed
      } else if (animModeRef.current === 'releasing') {
        const elapsed = now - releaseStartTimeRef.current
        const progress = Math.min(elapsed / 350, 1)
        // Decelerate smoothly with an ease-out over about 350ms
        const factor = (1 - progress) * (1 - progress)
        let targetSpeed = releaseInitialSpeedRef.current * factor

        // Respect end boundary during release as well
        const dist = releaseInitialSpeedRef.current < 0 ? el.scrollLeft : (maxScroll - el.scrollLeft)
        if (dist < 180) {
          const damping = Math.max(0, dist / 180)
          targetSpeed = targetSpeed * (damping * (2 - damping))
        }

        currentSpeedRef.current = targetSpeed

        if (progress >= 1 || Math.abs(currentSpeedRef.current) < 1.5) {
          // Came to complete rest wherever it lands without snapping
          animModeRef.current = 'idle'
          isHoldingActiveRef.current = false
          setRowScrollMode(false)
          updateArrows()
          rafRef.current = null
          return
        }
      } else {
        setRowScrollMode(false)
        updateArrows()
        rafRef.current = null
        return
      }

      let nextScroll = el.scrollLeft + currentSpeedRef.current * dt

      if (nextScroll <= 0) {
        nextScroll = 0
        if (animModeRef.current === 'releasing') {
          el.scrollLeft = 0
          animModeRef.current = 'idle'
          isHoldingActiveRef.current = false
          setRowScrollMode(false)
          updateArrows()
          rafRef.current = null
          return
        }
      } else if (nextScroll >= maxScroll) {
        nextScroll = maxScroll
        if (animModeRef.current === 'releasing') {
          el.scrollLeft = maxScroll
          animModeRef.current = 'idle'
          isHoldingActiveRef.current = false
          setRowScrollMode(false)
          updateArrows()
          rafRef.current = null
          return
        }
      }

      el.scrollLeft = nextScroll
      updateArrows()

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
  }, [setRowScrollMode, updateArrows])

  // Release hold handler: transitions to smooth ease-out over 350ms
  const releaseHold = useCallback(() => {
    if (animModeRef.current === 'holding') {
      animModeRef.current = 'releasing'
      releaseStartTimeRef.current = performance.now()
      releaseInitialSpeedRef.current = currentSpeedRef.current
    }
    isHoldingActiveRef.current = false
  }, [])

  // Tap animation: animate by one card width with ease-in-out over ~400ms using RAF
  const startTapAnimation = useCallback((dir) => {
    const el = rowRef.current
    if (!el) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)

    setRowScrollMode(true)
    animModeRef.current = 'tapping'

    const card = el.querySelector('[data-card="true"]')
    const cardWidth = card ? card.getBoundingClientRect().width : 385
    const gap = 20
    const moveAmount = cardWidth + gap

    const from = el.scrollLeft
    const maxScroll = el.scrollWidth - el.clientWidth
    const to = Math.max(0, Math.min(from + dir * moveAmount, maxScroll))

    if (Math.abs(to - from) < 1) {
      animModeRef.current = 'idle'
      setRowScrollMode(false)
      updateArrows()
      return
    }

    const duration = 400 // ~400ms
    const startTime = performance.now()
    const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

    const step = (now) => {
      if (!rowRef.current) return
      const p = Math.min((now - startTime) / duration, 1)
      rowRef.current.scrollLeft = from + (to - from) * easeInOutQuad(p)
      updateArrows()

      if (p < 1) {
        rafRef.current = requestAnimationFrame(step)
      } else {
        rowRef.current.scrollLeft = to
        animModeRef.current = 'idle'
        setRowScrollMode(false)
        updateArrows()
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(step)
  }, [setRowScrollMode, updateArrows])

  // Unified pointer handlers for arrow buttons
  const makeArrowHandlers = useCallback((dir) => {
    const handlePointerDown = (e) => {
      if (e.button !== undefined && e.button !== 0) return
      e.preventDefault()
      try {
        e.currentTarget.setPointerCapture(e.pointerId)
      } catch (_) {}

      pressStartTimeRef.current = performance.now()
      pressDirRef.current = dir
      isHoldingActiveRef.current = false

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)

      holdTimerRef.current = setTimeout(() => {
        isHoldingActiveRef.current = true
        startHold(dir)
      }, 200)
    }

    const handlePointerUp = (e) => {
      if (pressDirRef.current !== dir) return
      try {
        if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      } catch (_) {}

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      const elapsed = performance.now() - pressStartTimeRef.current

      if (isHoldingActiveRef.current || animModeRef.current === 'holding') {
        releaseHold()
      } else if (elapsed < 200 && pressStartTimeRef.current > 0) {
        startTapAnimation(dir)
      }

      pressStartTimeRef.current = 0
      pressDirRef.current = 0
    }

    const handlePointerCancel = (e) => {
      if (pressDirRef.current !== dir) return
      try {
        if (e.currentTarget.hasPointerCapture && e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId)
        }
      } catch (_) {}

      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (isHoldingActiveRef.current || animModeRef.current === 'holding') {
        releaseHold()
      }
      pressStartTimeRef.current = 0
      pressDirRef.current = 0
    }

    return {
      onPointerDown: handlePointerDown,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerCancel,
    }
  }, [startHold, releaseHold, startTapAnimation])

  const leftHandlers = makeArrowHandlers(-1)
  const rightHandlers = makeArrowHandlers(1)

  // Drag-to-scroll with mouse
  const handleMouseDown = (e) => {
    if (e.button !== 0) return
    const el = rowRef.current
    if (!el) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    animModeRef.current = 'idle'
    setRowScrollMode(true)

    isDraggingRef.current = true
    hasDraggedRef.current = false
    dragStartXRef.current = e.pageX
    dragStartScrollLeftRef.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return
    const el = rowRef.current
    if (!el) return
    const dx = e.pageX - dragStartXRef.current
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true
    }
    el.scrollLeft = dragStartScrollLeftRef.current - dx
    updateArrows()
  }

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    const el = rowRef.current
    if (!el) return
    el.style.cursor = 'grab'
    el.style.removeProperty('user-select')
    setRowScrollMode(false)
    updateArrows()
    setTimeout(() => {
      hasDraggedRef.current = false
    }, 50)
  }

  const handleCardClick = (cat) => {
    if (hasDraggedRef.current) return
    onSelect(cat)
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center px-2 sm:px-6 py-6 sm:py-10 overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <ScreenBackground />
      <div className="relative z-10 w-full max-w-[1240px] mx-auto flex flex-col items-center">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="self-start mb-6 flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-pink-400/70 text-white text-sm font-bold shadow-[0_0_18px_rgba(244,63,94,0.45)] hover:bg-slate-800 hover:border-pink-400 hover:shadow-[0_0_28px_rgba(244,63,94,0.65)] hover:-translate-x-1 active:scale-95 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        {/* Header */}
        <header className="text-center mb-6 sm:mb-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 mb-3 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"></span>
            <span className="text-[11px] font-semibold tracking-widest uppercase text-pink-200">Face Off: Female</span>
          </div>
          <h1 className="font-baloo font-['Baloo_2',sans-serif] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-pink-400 via-rose-300 to-fuchsia-400 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(244,63,94,0.3)]">
            Choose Your Category
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300/90 font-medium tracking-wide max-w-md">
            Pick a sub-category to start the female face-off!
          </p>
        </header>

        {/* Horizontal row with arrows (sitting directly on the page background, no dark rectangular band) */}
        <div className="w-full max-w-[1140px] flex items-center justify-center gap-2 sm:gap-4 px-1 sm:px-2">
          <ScrollArrow direction="left" disabled={!canLeft} {...leftHandlers} />

          <div
            ref={rowRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex-1 overflow-x-auto no-scrollbar py-6 sm:py-8 cursor-grab"
            style={{
              scrollBehavior: 'auto',
              scrollSnapType: isTouchDevice ? 'x proximity' : 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex items-center gap-5 px-1 sm:px-2" style={{ width: 'max-content' }}>
              {ACTRESS_SUBCATEGORIES.map((sub) => (
                <SubCategoryCard key={sub.id} cat={sub} onClick={handleCardClick} />
              ))}
            </div>
          </div>

          <ScrollArrow direction="right" disabled={!canRight} {...rightHandlers} />
        </div>
      </div>
    </div>
  )
}
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
      <ActressSubMenu
        onBack={() => setShowActressSubMenu(false)}
        onSelect={handleSubCategoryClick}
      />
    )
  }

  // ── Main category selection screen ─────────────────────────────────────────
  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center justify-center overflow-x-hidden selection:bg-pink-500 selection:text-white">
      <ScreenBackground />

      <div
        className="w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 my-auto"
        style={{
          width: '111.111111%',
          maxWidth: '111.111111%',
          transform: 'scale(0.9)',
          transformOrigin: 'top center',
        }}
      >
        <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
          {/* Header */}
          <header className="text-center mb-8 sm:mb-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 mb-3 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[11px] font-semibold tracking-widest uppercase text-cyan-200">
                Interactive Choice Game
              </span>
            </div>

            <h1 className="font-baloo font-['Baloo_2',sans-serif] text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-cyan-400 via-teal-300 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_4px_24px_rgba(6,182,212,0.3)]">
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
    </div>
  )
}
