import { useState } from 'react'
import './App.css'

function App () {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <h1 class="text-3xl font-bold underline">
          Hello world!
        </h1>

        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <h1 className="text-3xl font-bold text-blue-600 mb-4">
              Tailwind CSS + React
            </h1>
            <p className="text-gray-700 mb-4">
              Tailwind is working inside your React app!
            </p>
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Click Me
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
