import { useState, useCallback, useEffect } from "react";

let logoutTime: ReturnType<typeof setTimeout> | undefined;

interface AuthHook {
    token: string | null;
    userId: string | null;
    userEmail: string | null;
    profilePhoto: string | null;
    isAdmin: boolean;
    isBlocked: boolean;
    login: (uid: string, token: string, email: string, profilePhoto?: string, expirationDate?: Date, isAdmin?: boolean, isBlocked?: boolean) => void;
    logout: () => void;
}

export function useAuth(): AuthHook {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [tokenExpirationTime, setTokenExpirationTime] = useState<Date | null>(null);
    const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
    const [isAdmin, setAdmin] = useState<boolean>(false);
    const [isBlocked, setBlocked] = useState<boolean>(false);

    const login = useCallback((uid: string, token: string, email: string, profilePhoto?: string, expirationDate?: Date, admin?: boolean, blocked?: boolean) => {
        localStorage.setItem('token', token);
        if (profilePhoto) {
            localStorage.setItem('profilePhoto', profilePhoto);
        } else {
            localStorage.removeItem('profilePhoto');
        }
        localStorage.setItem('userId', uid);
        localStorage.setItem('userEmail', email);
        setAdmin(!!admin);
        setBlocked(!!blocked);
        setToken(token);
        setUserId(uid);
        setUserEmail(email);
        setProfilePhoto(profilePhoto || null);
        const expiration = expirationDate instanceof Date
            ? expirationDate
            : new Date(new Date().getTime() + 1000 * 60 * 60);
        setTokenExpirationTime(expiration);
        localStorage.setItem(
            'userData',
            JSON.stringify({ userId: uid, token: token, email: email, expiration: expiration.toISOString(), isAdmin: !!admin, isBlocked: !!blocked })
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
        setAdmin(false);
        setBlocked(false);
        localStorage.removeItem('userData');
    }, []);

    const fetchUserData = useCallback(async (token: string) => {
        try {
            const res = await fetch("http://localhost:5000/api/user/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.ok) {
                const user = await res.json();
                setAdmin(!!user.isAdmin);
                setBlocked(!!user.isBlocked);
                setProfilePhoto(user.photoBase64 || null);
                const stored = localStorage.getItem('userData');
                if (stored) {
                    const data = JSON.parse(stored);
                    data.isAdmin = !!user.isAdmin;
                    data.isBlocked = !!user.isBlocked;
                    localStorage.setItem('userData', JSON.stringify(data));
                }
            }
        } catch (e) {
            // ignore
        }
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
            const data: { userId: string; email: string; token: string; expiration: string, isAdmin: boolean, isBlocked: boolean } = JSON.parse(stored);
            console.log('Loaded userData from localStorage:', data); // Debug log
            if (data && data.token && new Date(data.expiration) > new Date()) {
                login(data.userId, data.token, data.email, localStorage.getItem('profilePhoto') || undefined, new Date(data.expiration), data.isAdmin, data.isBlocked);
            }
        } else {
            console.log('No userData found in localStorage'); // Debug log
        }
    }, [login]);

    useEffect(() => {
        if (token) {
            fetchUserData(token);
        }
    }, [token, fetchUserData]);

    return { token, userId, userEmail, login, logout, profilePhoto, isAdmin, isBlocked };
}