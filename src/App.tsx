import { useState } from 'react'
import './App.css'
import { MonthView } from './components/views/MonthView';

function App () {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* <Header /> */}
      <MonthView />
    </>
  )
}

export default App
