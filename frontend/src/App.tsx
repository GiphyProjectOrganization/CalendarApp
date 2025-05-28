import { useState } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Register } from './pages/Auth/Register';
import { Link } from 'react-router-dom';
import { MonthView } from './components/views/MonthView';


function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        <Link className='text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium ' to='/register'>Register</Link>

        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<MonthView />} />

        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
