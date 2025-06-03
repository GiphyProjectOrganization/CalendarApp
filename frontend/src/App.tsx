import { useCallback, useContext, useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, BrowserRouter, Outlet } from 'react-router-dom';
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

function App() {
  const { token, userId, logout, login } = useAuth();
  const [forecast, setForecast] = useState([]);
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const fahrenheitCountries = ['US', 'BS', 'BZ', 'KY', 'PW'];
        setUnit(fahrenheitCountries.includes(data.country_code) ? 'imperial' : 'metric');
        return { lat: data.latitude, lon: data.longitude };
      })
      .then(({ lat, lon }) => {
        fetch(`${WEATHER_API_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=${unit}&appid=${WEATHER_API_KEY}`)
          .then(res => res.json())
          .then(data => setForecast(data.daily || []));
      });
  }, [unit]);

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!token, userId, token, login, logout }}>
      <div>
        {token ? 'User is logged' : 'User is not logged'}
      </div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<MonthView />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path="/calendar" element={<Outlet />}>
            <Route path="day" element={<DayView forecast={forecast} unit={unit} />} />
            <Route path="week" element={<WeekView />} />
            <Route path="month" element={<MonthView />} />
            <Route index element={<MonthView />} />
          </Route>
          <Route path="/events/create" element={<CreateEvent />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
