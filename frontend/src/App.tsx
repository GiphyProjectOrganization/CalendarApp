import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { Register } from './pages/Auth/Register';
import { MonthView } from './components/views/monthView/MonthView';
import { WeekView } from './components/views/WeekView';
import { Header } from './components/layout/Header';
import { AuthContext } from '../context/authContext';
import LoginPage from './pages/Auth/Login';
import CreateEvent from './pages/Events/CreateEvent';



function App() {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const login = useCallback((uid: string, token: string, expirationDate?: Date) => {
    setToken(token);
    setUserId(uid);
    const tokenExpirationTime = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
    localStorage.setItem(
      'userData',
      JSON.stringify({ userId: uid, token: token, expiration: tokenExpirationTime.toISOString() })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUserId(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (stored) {
      const data = JSON.parse(stored);
      if (data && data.token && new Date(data.expiration) > new Date()) {
        login(data.userId, data.token, new Date(data.expiration));
      }
    }
  }, [login]);

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
          <Route path="/calendar" element={<MonthView />}>
            {/* <Route path="day" element={<DayView />} /> */}
            <Route path="week" element={<WeekView />} />
            <Route path="month" element={<MonthView />} />
            <Route index element={<MonthView />} /> {/* default */}
          </Route>
          <Route path="/events/create" element={<CreateEvent />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
