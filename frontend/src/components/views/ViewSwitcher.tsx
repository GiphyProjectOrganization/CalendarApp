import React from "react";
import { Link, useLocation } from "react-router-dom";

const views = [
  { name: "Day", path: "/calendar/day" },
  { name: "Week", path: "/calendar/week" },
  { name: "Month", path: "/calendar/month" },
];

export const ViewSwitcher = () => {
  const location = useLocation();

  const currentView = views.find(v => location.pathname.startsWith(v.path)) || views[2];

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-primary btn-sm hover:bg-accent hover:text-accent-content capitalize mr-1">
        {currentView.name} View
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 ml-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </label>

      <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-44">
        {views.map(({ name, path }) => (
          <li key={name}>
            <Link
              to={path}
              className={`capitalize ${location.pathname.startsWith(path) ? 'font-bold text-primary' : ''}`}
            >
              {name} View
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
