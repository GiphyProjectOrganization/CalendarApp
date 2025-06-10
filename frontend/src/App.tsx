import { useCallback, useContext, useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, BrowserRouter, Outlet, Navigate } from 'react-router-dom';
import { Register } from './pages/Auth/Register';
import { MonthView } from './components/views/monthView/MonthView';
import { WeekView } from './components/views/WeekView';
import { Header } from './components/layout/Header';
import { AuthContext } from './components/contexts/authContext/authContext';
import LoginPage from './pages/Auth/Login';
import CreateEvent from './pages/Events/CreateEvent';
import { DayView } from './components/views/DayView';
import { useAuth } from './hook/auth-hook';
import { WEATHER_API_KEY, WEATHER_API_URL } from './constants';
import { ProfileCard } from './components/profile/ProfileCard';
import { Footer } from './components/layout/Footer';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(AuthContext);
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const { token, userId, logout, login } = useAuth();

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, userId, token, login, logout }}>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<MonthView />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/profileCard' element={<ProfileCard />} />
          <Route path="/calendar" element={<Outlet />}>
            <Route path="day" element={<DayView/>} />
            <Route path="week" element={<WeekView />} />
            <Route path="month" element={<MonthView />} />
            <Route index element={<MonthView />} />
          </Route>
          <Route 
            path="/events/create" 
            element={
              <ProtectedRoute>
                <CreateEvent />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
      <Footer />
    </AuthContext.Provider>
  );
}

export default App;