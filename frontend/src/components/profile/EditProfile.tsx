import React, { useState, ChangeEvent, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hook/auth-hook";

type UserRegister = {
    phoneNumber: string;
    firstName: string;
    lastName: string;
    photoBase64: string;
};

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function EditProfile() {
    const { token } = useAuth();
    const [user, setUser] = useState<UserRegister>({
        phoneNumber: '',
        firstName: '',
        lastName: '',
        photoBase64: ''
    });

    const navigate = useNavigate();

    const updateUser = (prop: keyof UserRegister) => async (e: ChangeEvent<HTMLInputElement>) => {
        if (prop === "photoBase64" && e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 1024 * 1024) {
                alert("Image must be under 1MB.");
                return;
            }
            const base64 = await fileToBase64(file);
            setUser((prev) => ({
                ...prev,
                photoBase64: base64
            }));
        } else {
            setUser((prev) => ({
                ...prev,
                [prop]: e.target.value
            }));
        }
    };

    const editUser = async (e: React.FormEvent) => {
        e.preventDefault();

        const editProp: Partial<UserRegister> = {};
        if (user.firstName.trim()) {
            if (user.firstName.length < 1 || user.firstName.length >= 30 || !/^[A-Za-z]+$/.test(user.firstName)) {
                return alert("First name must be between 1 and 30 characters and include only letters!");
            }
            editProp.firstName = user.firstName.trim();
        }
        if (user.lastName.trim()) {
            if (user.lastName.length < 1 || user.lastName.length >= 30 || !/^[A-Za-z]+$/.test(user.lastName)) {
                return alert("Last name must be between 1 and 30 characters and include only letters!");
            }
            editProp.lastName = user.lastName.trim();
        }
        if (user.phoneNumber.trim()) {
            if (user.phoneNumber.length !== 10 || !/^\d+$/.test(user.phoneNumber)) {
                return alert("Phone Number must be 10 digits and include only numbers!");
            }
            editProp.phoneNumber = user.phoneNumber.trim();
        }
        if (user.photoBase64.trim()) {
            editProp.photoBase64 = user.photoBase64.trim();
        }

        if (Object.keys(editProp).length === 0) {
            return alert("Please enter at least one property to update.");
        }

        try {
            if (!token) {
                alert("Invalid token");
                return;
            }
            const res = await fetch("http://localhost:5000/api/user/me", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editProp),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Profile updated successfully!");
                navigate('/myProfileCard')
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (err) {
            alert("Failed to update profile.");
        }
    };

    return (
        <div className="flex justify-center  mt-10 items-center min-h-[60vh]">
            <div className="rounded-2xl shadow-xl border p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
                <form className="space-y-4" onSubmit={editUser}>
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            placeholder="Enter first name"
                            value={user.firstName}
                            onChange={updateUser('firstName')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            placeholder="Enter last name"
                            value={user.lastName}
                            onChange={updateUser('lastName')}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                            placeholder="Enter phone number"
                            value={user.phoneNumber}
                            onChange={updateUser('phoneNumber')}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="photo"
                            className="block mb-2 text-sm font-medium"
                        >
                            Profile Photo
                        </label>
                        <div className="flex flex-col items-center">
                            <label
                                htmlFor="photo"
                                className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed  rounded-full cursor-pointer transition"
                            >
                                {user.photoBase64 ? (
                                    <img
                                        src={user.photoBase64}
                                        alt="Preview"
                                        className="h-28 w-28 rounded-full object-cover border-2 shadow"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-sm text-center">
                                        Click to upload
                                        <p>(under 1 mb)</p>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={updateUser('photoBase64')}
                                    name="photo"
                                    id="photo"
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                    <button
                        className="px-5 py-2 rounded-lg outline-1 font-bold transition-transform duration-200 hover:scale-110"
                        type="submit"
                    >
                        Edit
                    </button>
                </form>
            </div>
        </div>
    );
}