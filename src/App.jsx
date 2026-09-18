import { useState } from 'react'
import CategorySelectScreen from './components/CategorySelectScreen'
import ComparisonScreen from './components/ComparisonScreen'

function App() {
  const [selectedCategory, setSelectedCategory] = useState(null)

  if (!selectedCategory) {
    return <CategorySelectScreen onSelectCategory={(cat) => setSelectedCategory(cat)} />
  }

  return (
    <ComparisonScreen
      category={selectedCategory}
      onBackToCategories={() => setSelectedCategory(null)}
    />
  )
}

export default App