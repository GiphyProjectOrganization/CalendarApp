import React, { useContext } from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link } from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";
import { AuthContext } from "../../../context/authContext";

export const Header: React.FC = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <ThemeSwap />
      </div>
      <div className="navbar-center hidden lg:flex">
        <WeatherForecast />
      </div>
      <div className="navbar-end">
        <Link to="/events/create" className="btn btn-primary btn-sm mr-2">
          + New Event
        </Link>
        <ViewSwitcher />
        {!isLoggedIn && (
          <Link
            className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 py-2"
            to="/login"
          >
            Login
          </Link>
        )}
        <Link
          className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 py-2"
          to="/register"
        >
          Register
        </Link>
      </div>
    </div>
  );
};


export default Header;
