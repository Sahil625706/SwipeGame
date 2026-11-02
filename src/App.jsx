import { useState, useEffect } from 'react'
import CategorySelectScreen from './components/CategorySelectScreen'
import ComparisonScreen from './components/ComparisonScreen'
import FeedbackHub from './components/FeedbackHub'
import CookieBanner from './components/CookieBanner'
import AboutPage from './pages/AboutPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname.toLowerCase()
    }
    return '/'
  })

  useEffect(() => {
    function handlePopState() {
      setCurrentPath(window.location.pathname.toLowerCase())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  function navigate(path) {
    const cleanPath = path.toLowerCase()
    if (typeof window !== 'undefined' && window.location.pathname.toLowerCase() !== cleanPath) {
      window.history.pushState({}, '', path)
    }
    setCurrentPath(cleanPath)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  function goHome() {
    navigate('/')
    setSelectedCategory(null)
  }

  // Route matching
  if (currentPath === '/about') {
    return (
      <>
        <FeedbackHub onNavigate={navigate} />
        <AboutPage onHome={goHome} />
        <CookieBanner onNavigate={navigate} />
      </>
    )
  }

  if (currentPath === '/privacy') {
    return (
      <>
        <FeedbackHub onNavigate={navigate} />
        <PrivacyPage onHome={goHome} />
        <CookieBanner onNavigate={navigate} />
      </>
    )
  }

  if (currentPath === '/terms') {
    return (
      <>
        <FeedbackHub onNavigate={navigate} />
        <TermsPage onHome={goHome} />
        <CookieBanner onNavigate={navigate} />
      </>
    )
  }

  if (currentPath === '/contact') {
    return (
      <>
        <FeedbackHub onNavigate={navigate} />
        <ContactPage onHome={goHome} />
        <CookieBanner onNavigate={navigate} />
      </>
    )
  }

  return (
    <>
      <FeedbackHub onNavigate={navigate} />
      {!selectedCategory ? (
        <CategorySelectScreen
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          onNavigate={navigate}
        />
      ) : (
        <ComparisonScreen
          category={selectedCategory}
          onBackToCategories={() => setSelectedCategory(null)}
        />
      )}
      <CookieBanner onNavigate={navigate} />
    </>
  )
}

export default App