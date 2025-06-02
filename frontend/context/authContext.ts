import { createContext } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    userId: string | null;
    token: string | null;
    login: (token: string, userId: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    userId: null,
    token: null,
    login: () => { },
    logout: () => { }
});