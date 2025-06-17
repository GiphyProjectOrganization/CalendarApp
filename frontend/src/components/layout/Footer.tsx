import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="mt-5 text-center">
      <span className="block text-sm sm:text-center mb-1">
        © 2025 TimeBuddy™. All Rights Reserved.
      </span>
      <Link
        to="/about-us"
        className="text-blue-600 hover:underline text-sm cursor-pointer"
      >
        About Us
      </Link>
    </footer>
  );
};
