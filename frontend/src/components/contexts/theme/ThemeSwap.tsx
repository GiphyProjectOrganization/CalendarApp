import { useChangeTheme } from "../../../services/themeService";

const ThemeSwap = () => {
  const { changeTheme } = useChangeTheme();

  return (
    <div className="dropdown">
      <button
        tabIndex={0}
        role="button"
        className="btn btn-square btn-ghost flex w-full p-2"
      >
        Theme
        <svg
          width="12px"
          height="12px"
          className="h-2 w-2 fill-current opacity-60 inline-block"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 2048 2048"
        >
          <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
        </svg>
      </button>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
      >
        {items.map((i) => (
          <li
            key={i.label}
            onClick={(e) => {
              if (changeTheme) changeTheme(e);
            }}
          >
            <input
              type="radio"
              name="theme-dropdown"
              className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
              aria-label={i.label}
              value={i.label.toLowerCase()}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const items = [
  { label: "Honey" },
  { label: "Forest" },
  { label: "Ocean" },
];

export default ThemeSwap;