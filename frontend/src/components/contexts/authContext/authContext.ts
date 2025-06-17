import { createContext } from "react";

interface AuthContextType {
    isLoggedIn: boolean;
    userId: string | null;
    userEmail: string | null;
    isAdmin: boolean;
    isBlocked: boolean;
    token: string | null;
    profilePhoto: string | null;
    login: (
        uid: string,
        token: string,
        email: string,
        profilePhoto?: string,
        expirationDate?: Date,
        isAdmin?: boolean,
        isBlocked?: boolean
    ) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isLoggedIn: false,
    isAdmin: false,
    isBlocked: false,
    userId: null,
    userEmail: null,
    token: null,
    profilePhoto: null,
    login: () => { },
    logout: () => { }
});