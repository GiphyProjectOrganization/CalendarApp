import { useEffect, useState, useContext } from 'react';
import { useAuth } from '../../hook/auth-hook';
import { ThemeContext } from '../contexts/theme/ThemeContext';
import { Link } from 'react-router-dom';

export function ProfileCard () {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const { theme } = useContext(ThemeContext);


    let userPropStyle = { color: "#FF7800" }; // default for light (bright pink)
    if (theme === "ocean") userPropStyle = { color: '#068D9D' }; // bright blue
    else if (theme === "forest") userPropStyle = { color: "#9AB659" }; // bright green


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
        <div className="flex justify-center items-center mt-10 min-h-[60vh]">
            <div
                className="relative rounded-2xl shadow-2xl border p-10 w-full max-w-2xl transition-transform hover:scale-105 animate-fade-in"
                style={{ animation: "fadeIn 0.7s" }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg mb-3 border-4">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <h1 className="font-cubao mr-1">Welcome, {user.username}</h1>
                    <span className="font-cubao mr-1 ">Profile Overview:</span>
                </div>
                <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">First Name:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.firstName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Last Name:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.lastName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Email:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Phone:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.phoneNumber}</span>
                    </div>
                </div>
                <div className="flex justify-end mt-6">
                    <Link
                        className="px-5 py-2 rounded-lg outline-1 font-bold transition-transform duration-200 hover:scale-110"
                        type="button"
                        to='/EditProfile'
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </div >
    );
}
