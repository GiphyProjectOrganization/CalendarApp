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
import { EditProfile } from './components/profile/EditProfile';
import EventPage from './pages/Events/EventPage';
import { UserProfile } from './components/profile/UserProfile';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageUsers from './pages/Admin/ManageUsers';
import ManageEvents from './pages/Admin/ManageEvents';
import ContactsView from './components/contacts/ContactsView';
import { AboutUs } from './components/aboutus/AboutUs';
import EditEvent from './pages/Events/EditEvent';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, isAdmin } = useContext(AuthContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { token, userId, userEmail, logout, login, profilePhoto, isAdmin, isBlocked } = useAuth();

  return (
    <BrowserRouter>
      <AuthContext.Provider value={{
        isLoggedIn: !!token,
        token,
        userId,
        userEmail,
        profilePhoto,
        isAdmin,
        isBlocked,
        login,
        logout
      }}>
        <Header onMenuClick={function (): void {
          throw new Error('Function not implemented.');
        }} />
        <Routes>
          <Route path='/register' element={<Register />} />
          <Route path='/' element={<MonthView />} />
          <Route path='/editProfile' element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/userProfile/:userId' element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path='/myProfileCard' element={<ProtectedRoute><ProfileCard /></ProtectedRoute>} />
          <Route path="/calendar" element={<Outlet />}>
            <Route path="day" element={<DayView />} />
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
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/events/:eventId" element={<ProtectedRoute><EventPage /></ProtectedRoute>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-events"
            element={
              <ProtectedRoute adminOnly={true}>
                <ManageEvents />
              </ProtectedRoute>
            }
          />
          <Route path="/events/edit/:eventId" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
          <Route path='/about-us' element={<AboutUs />} />
        </Routes>
        <Footer />
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

export default App;