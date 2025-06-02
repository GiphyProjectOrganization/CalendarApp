import { useState, useCallback, useEffect, Dispatch, SetStateAction } from "react";

let logoutTime: ReturnType<typeof setTimeout> | undefined;

interface AuthHook {
    token: string | null;
    userId: string | null;
    login: (uid: string, token: string, expirationDate?: Date) => void;
    logout: () => void;
}

export function useAuth(): AuthHook {
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [tokenExpirationTime, setTokenExpirationTime] = useState<Date | null>(null);

    const login = useCallback((uid: string, token: string, expirationDate?: Date) => {
        setToken(token);
        setUserId(uid);
        const expiration = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationTime(expiration);
        localStorage.setItem(
            'userData',
            JSON.stringify({ userId: uid, token: token, expiration: expiration.toISOString() })
        );
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setTokenExpirationTime(null);
        setUserId(null);
        localStorage.removeItem('userData');
    }, []);

    useEffect(() => {
        if (token && tokenExpirationTime) {
            const remainingTime = tokenExpirationTime.getTime() - new Date().getTime();
            logoutTime = setTimeout(logout, remainingTime);
        } else if (logoutTime) {
            clearTimeout(logoutTime);
        }
    }, [token, logout, tokenExpirationTime]);

    useEffect(() => {
        const stored = localStorage.getItem('userData');
        if (stored) {
            const data: { userId: string; token: string; expiration: string } = JSON.parse(stored);
            if (data && data.token && new Date(data.expiration) > new Date()) {
                login(data.userId, data.token, new Date(data.expiration));
            }
        }
    }, [login]);

    return { token, userId, login, logout };
}