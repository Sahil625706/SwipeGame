import { useState } from 'react'
import CategorySelectScreen from './components/CategorySelectScreen'
import ComparisonScreen from './components/ComparisonScreen'
import FeedbackHub from './components/FeedbackHub'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  return (
    <>
      <FeedbackHub />
      {!selectedCategory ? (
        <CategorySelectScreen onSelectCategory={(cat) => setSelectedCategory(cat)} />
      ) : (
        <ComparisonScreen
          category={selectedCategory}
          onBackToCategories={() => setSelectedCategory(null)}
        />
      )}
    </>
  )
}

export default App