import React from "react";
import ThemeSwap from "../contexts/theme/ThemeSwap";
import { Link, Outlet} from "react-router-dom";
import { ViewSwitcher } from "../views/ViewSwitcher";
import { useState } from "react";
import { WeekView } from "../views/WeekView";
import { MonthView } from "../views/monthView/MonthView";

export const Header: React.FC = () => {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month');

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <ThemeSwap />
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><a>Home</a></li>
          <li><a>About</a></li>
          <li><a>Contact</a></li>
        </ul>
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
