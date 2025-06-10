import React, { useContext } from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link } from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";
import { AuthContext } from "../contexts/authContext/authContext";
import './Header.css';

export function Header() {
  const { isLoggedIn, logout } = useContext(AuthContext);

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <Link to='/' className="font-cubao mr-1">TimeBuddy</Link>
        <ThemeSwap />
      </div>
      <div className="navbar-center hidden lg:flex">
        <WeatherForecast />
      </div>
      <div className="navbar-end">
        {isLoggedIn && (
          <Link className="btn btn-primary hover:bg-accent hover:text-accent-content btn-sm mr-1" to="/events/create">
              + New Event
          </Link>
        )}
        
        <ViewSwitcher />

        {isLoggedIn && (
          <Link
            className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-primary-content px-3 mr-1 py-2"
            to="/profileCard"
          >
            My Profile
          </Link>
        )}
        {isLoggedIn &&
          <Link
            className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-primary-content px-3 py-2 mr-1"
            onClick={logout}
            to='/'
          >
            LogOut
          </Link>
        }
        {!isLoggedIn && (
          <Link
            className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 mr-1 py-2"
            to="/login"
          >
            Login
          </Link>
        )}
        {!isLoggedIn &&
          <Link
            className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 mr-1 py-2"
            to="/register"
          >
            Register
          </Link>}
      </div>
    </div>
  );
};


export default Header;
