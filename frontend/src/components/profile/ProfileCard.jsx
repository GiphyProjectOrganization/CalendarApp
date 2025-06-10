import { useEffect, useState } from 'react';
import { useAuth } from '../../hook/auth-hook';

export function ProfileCard () {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        if (token === null) return; // Still initializing

        const fetchUser = async () => {
            if (!token) {
                setError('No token found');
                setLoading(false);
                return;
            }
            try {
                const res = await fetch('http://localhost:5000/api/user/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Unauthorized');
                const data = await res.json();
                setUser(data);
            } catch (err) {
                setError(err.message || 'Unauthorized');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!user) return <p>No user data.</p>;

    return (
        <div>
            <h1>Welcome, {user.username}</h1>
            <p>First Name: {user.firstName}</p>
            <p>Last Name: {user.lastName}</p>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phoneNumber}</p>
        </div>
    );
}   