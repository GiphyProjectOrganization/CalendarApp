import { createContext } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    userId: string | null;
    userEmail: string | null;
    token: string | null;
    login: (token: string, userId: string, userEmail: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    userId: null,
    userEmail: null,
    token: null,
    login: () => { },
    logout: () => { }
});