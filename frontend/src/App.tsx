import { useState } from 'react'
import './App.css'
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Register } from './pages/Auth/Register';
import { MonthView } from './components/views/monthView/MonthView';
import { WeekView } from './components/views/WeekView';
import { Header } from './components/layout/Header';
import { Outlet } from 'react-router-dom';
import CreateEvent from './pages/Events/CreateEvent';

function App() {
  return (
    <>
      <BrowserRouter>

        <Header />

        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<MonthView />} />
          
          <Route path="/calendar" element={<MonthView />}>
            {/* <Route path="day" element={<DayView />} /> */}
            <Route path="week" element={<WeekView />} />
            <Route path="month" element={<MonthView />} />
            <Route index element={<MonthView />} /> {/* default */}
          </Route>
          <Route path="/events/create" element={<CreateEvent />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
