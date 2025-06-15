import { useState, useCallback, useEffect } from "react";

let logoutTime: ReturnType<typeof setTimeout> | undefined;

interface AuthHook {
    token: string | null;
    userId: string | null;
    userEmail: string | null;
    profilePhoto: string | null;
    login: (uid: string, token: string, email: string, profilePhoto?: string, expirationDate?: Date) => void;
    logout: () => void;
}

export function useAuth(): AuthHook {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [tokenExpirationTime, setTokenExpirationTime] = useState<Date | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

    const login = useCallback((uid: string, token: string, email: string, profilePhoto?: string, expirationDate?: Date) => {
        localStorage.setItem('token', token);
        if (profilePhoto) {
            localStorage.setItem('profilePhoto', profilePhoto);
        } else {
            localStorage.removeItem('profilePhoto');
        }
        localStorage.setItem('userId', uid);
        localStorage.setItem('userEmail', email);
        setToken(token);
        setUserId(uid);
        setUserEmail(email);
        setProfilePhoto(profilePhoto || null);
        const expiration = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationTime(expiration);
        localStorage.setItem(
            'userData',
            JSON.stringify({ userId: uid, token: token, email: email, expiration: expiration.toISOString() })
        );
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('profilePhoto');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setToken(null);
        setTokenExpirationTime(null);
        setUserId(null);
        setUserEmail(null);
        setProfilePhoto(null);
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
            const data: { userId: string; email: string; token: string; expiration: string } = JSON.parse(stored);
            if (data && data.token && new Date(data.expiration) > new Date()) {
                login(data.userId, data.token, data.email, localStorage.getItem('profilePhoto') || undefined, new Date(data.expiration));
            }
        }
    }, [login]);

    return { token, userId, userEmail, login, logout, profilePhoto };
}