import React, { useContext, useState, useRef } from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";
import { AuthContext } from "../contexts/authContext/authContext";
import './Header.css';
import { useAuth } from "../../hook/auth-hook";
import { FiMenu, FiPlus, FiUsers } from 'react-icons/fi';
interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { isLoggedIn, logout, profilePhoto } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  //backend
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (!value.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    //this timeout is for prevents sending a request for every single keystroke!
    searchTimeout.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `http://localhost:5000/api/users/lookup?query=${encodeURIComponent(value)}`,
          {
            headers: {
              "Authorization": token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) {
          throw new Error("Failed to search users");
        }
        const data = await res.json();
        setSearchResults(data);
        setIsSearching(false);
      } catch (err) {
        setSearchError("Error searching users");
        setIsSearching(false);
      }
    }, 300);
  };

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        {isLoggedIn && (
          <label htmlFor="sidebar-toggle" className="btn btn-ghost btn-circle lg:hidden">
            <FiMenu className="w-5 h-5" />
          </label>
        )}
        <Link to="/" className="font-cubao ml-2">TimeBuddy</Link>
        <ThemeSwap />
      </div>

      <div className="navbar-center hidden lg:flex">
        <WeatherForecast />
      </div>

      <div className="navbar-end">

        {isLoggedIn && <div className="dropdown dropdown-end mr-2">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </label>
          <div tabIndex={0} className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-72 mt-2">
            <input
              type="text"
              placeholder="Search users..."
              className="input input-bordered w-full"
              value={searchQuery}
              onChange={handleSearchChange}
              autoComplete="off"
            />

            {isSearching && (
              <div className="mt-2 text-center text-xs text-gray-500">Searching...</div>
            )}


            {searchError && (
              <div className="mt-2 text-error text-xs">{searchError}</div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <ul
                className=" mt-2 max-h-64 overflow-y-auto flex flex-col gap-1"
                style={{ minWidth: "16rem" }}
              >
                {searchResults.map(user => (
                  <li
                    key={user.id}
                    className="flex flex-col items-start py-2 px-2 hover:bg-primary hover:text-primary-content transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="flex-shrink-0">
                        <img
                          src={user.profilePhoto || "../uploads/noProfileImage.png"}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      </div>
                      <button
                        className="flex flex-col"
                        onClick={() => navigate(`/userProfile/${user.id}`)}
                      >
                        <span className="font-semibold text-base">{user.name}</span>
                        <span className="text-xs">{user.email}</span>
                        <span className="text-xs">{user.phoneNumber}</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && !searchError && (
              <div className="mt-2 text-xs text-gray-400 text-center">No users found.</div>
            )}
          </div>
        </div>}

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
                  to="/myProfileCard"
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

        {isLoggedIn && (
          <Link
            to="/admin"
            className="btn btn-sm btn-ghost text-warning mr-2"
          >
            Admin
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
