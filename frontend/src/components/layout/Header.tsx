import React from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link} from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { WeatherForecast } from "../weather/WeatherForecast";

export const Header: React.FC = () => {

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <ThemeSwap />
      </div>
      <div className="navbar-center hidden lg:flex">
        <WeatherForecast />
      </div>
      <div className="navbar-end">
        <ViewSwitcher />
        <a className="btn">Login</a>
        <Link className="btn btn-sm btn-ghost bg-accent text-base-content hover:bg-primary hover:text-white px-3 py-2" to="/register">
          Register
        </Link>      
      </div>
    </div>
  );
};

export default Header;
