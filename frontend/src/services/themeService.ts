import { useContext } from "react";
import { ThemeContext } from "../components/contexts/theme/ThemeContext";

export const useChangeTheme = () => useContext(ThemeContext);