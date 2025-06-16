import React, { useContext } from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link, NavLink } from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";
import { AuthContext } from "../contexts/authContext/authContext";
import './Header.css';
import { useAuth } from "../../hook/auth-hook";

export function Header() {
  const { isLoggedIn, logout, profilePhoto } = useContext(AuthContext);

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <Link to="/" className="font-cubao mr-1">TimeBuddy</Link>
        <ThemeSwap />
      </div>

      <div className="navbar-center hidden lg:flex">
        <WeatherForecast />
      </div>

      <div className="navbar-end">
        {isLoggedIn && (
          <Link
            className="btn btn-primary hover:bg-accent hover:text-accent-content btn-sm mr-2"
            to="/events/create"
          >
            + New Event
          </Link>
        )}

        <ViewSwitcher />

        {!isLoggedIn && (
          <>
            <Link
              className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 mr-1 py-2"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 mr-1 py-2"
              to="/register"
            >
              Register
            </Link>
          </>
        )}

        {isLoggedIn && (
          <div className="dropdown dropdown-end ml-3">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:scale-110 transition-transform">
              <div className="w-10 rounded-full">
                <img
                  src={profilePhoto || "uploads/noProfileImage.png"}
                  alt="Profile"
                  className="object-cover"
                />
              </div>
            </div>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-58 origin-top-right border-1 border-accent"
            >
              <li>
                <NavLink
                  to="/profileCard"
                  className="text-base text-base-content hover:bg-accent hover:text-accent-content"
                >
                  My Profile
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/editProfile"
                  className="text-base text-base-content hover:bg-accent hover:text-accent-content"
                >
                  Edit Profile
                </NavLink>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="text-base text-base-content hover:bg-error hover:text-error-content"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
