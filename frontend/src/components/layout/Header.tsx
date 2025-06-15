import React, { useContext } from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link, NavLink } from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";
import { AuthContext } from "../contexts/authContext/authContext";
import './Header.css';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'


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
        {isLoggedIn && <Menu as="div" className="relative ml-3">
          <div>
            <MenuButton className="relative flex text-sm focus:outline-hidden">
              <span className="absolute -inset-1.5" />
              {/* {userProfile.profilePhotoBase64 ? (
                <img
                  alt=""
                  src={userProfile.profilePhotoBase64}
                  className="size-10 rounded-full object-cover"
                />
              ) : ( */}
              <img
                alt=""
                src="uploads/noProfileImage.png"
                className='size-8 rounded-full object-cover' />
              {/* )} */}
            </MenuButton>
          </div>
          <MenuItems
            transition
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md py-1 shadow-lg ring-1  transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
          >
            {/* <MenuItem>
              <NavLink
                to={`/users/${currentUser.uid}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Your Profile
              </NavLink>
            </MenuItem> */}

            <MenuItem>
              <a
                onClick={logout}
                className="block px-4 py-2 text-sm cursor-pointer  data-focus:outline-hidden"
              >
                Sign out
              </a>
            </MenuItem>

            <MenuItem>
              <NavLink to='/profileCard'
                className="block px-4 py-2 text-sm cursor-pointer data-focus:outline-hidden"
              >
                My Profile
              </NavLink>
            </MenuItem>

            <MenuItem>
              <NavLink to='/editProfile'
                className="block px-4 py-2 text-sm  cursor-pointer data-focus:outline-hidden"
              >
                Edit Profile
              </NavLink>
            </MenuItem>
          </MenuItems>
        </Menu>}
      </div>
    </div>
  );
};


export default Header;
