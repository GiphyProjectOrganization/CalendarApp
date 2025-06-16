import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ThemeContext } from "../contexts/theme/ThemeContext";

interface UserProfileProps {
    photoBase64?: string;
    username: string;
    email: string;
    phoneNumber: string;
}

export const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<{ photoBase64?: string; username: string; name?: string; email: string; phoneNumber: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useContext(ThemeContext);

    let userPropStyle: React.CSSProperties = { color: "#FF7800" };
    if (theme === "ocean") userPropStyle = { color: '#068D9D' };
    else if (theme === "forest") userPropStyle = { color: "#9AB659" };

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetch(`http://localhost:5000/api/users/${userId}`)
            .then(res => {
                if (!res.ok) throw new Error("User not found");
                return res.json();
            })
            .then(data => {
                setUser({
                    photoBase64: data.profilePhoto,
                    username: data.username,
                    name: data.name,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                });
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, [userId]);

    if (loading) return <div>Loading...</div>;
    if (!user) return <div>User not found.</div>;

    return (
        <div className="flex justify-center items-center mt-10 min-h-[60vh]">
            <div
                className="relative rounded-2xl shadow-2xl border p-10 w-full max-w-2xl transition-transform hover:scale-105 animate-fade-in"
                style={{ animation: "fadeIn 0.7s" }}
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg mb-3 border-4 overflow-hidden">
                        {user.photoBase64 ? (
                            <img
                                src={user.photoBase64}
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        )}
                    </div>
                    <h1 className="font-cubao mr-1">Welcome, {user.username}</h1>
                    <span className="font-cubao mr-1 ">Profile Overview:</span>
                </div>
                <div className="space-y-2 w-full">
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Full name:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Email:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-cubao mr-1">Phone:</span>
                        <span className="font-cubao mr-1 break-all" style={userPropStyle}>{user.phoneNumber}</span>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Link
                            className="px-5 py-2 rounded-lg outline-1 font-bold transition-transform duration-200 hover:scale-110"
                            type="button"
                            to='/'
                        >
                            Back to home page
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};