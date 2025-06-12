import { useState, ChangeEvent, FormEvent, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/contexts/authContext/authContext";
import { useAuth } from "../../hook/auth-hook";

interface UserRegister {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    phoneNumber: string;
    photoBase64?: string;
}

export function Register() {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    const [user, setUser] = useState<UserRegister>({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        phoneNumber: '',
        photoBase64: ''
    });

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

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

    const register = async (e: FormEvent<HTMLButtonElement>) => {
        e.preventDefault();

        if (
            !user.email.trim() ||
            !user.password.trim() ||
            !user.username.trim() ||
            !user.lastName.trim() ||
            !user.firstName.trim() ||
            !user.phoneNumber.trim()
        ) {
            return alert("Please enter valid credentials.");
        }

        if (user.username.length < 3 || user.username.length >= 30) {
            return alert("Username must be between 3 and 30 character!")
        }
        if (!/\d/.test(user.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(user.password)) {
            return alert("Password must have one number and one symbol!")
        }
        if (user.firstName.length < 1 || user.firstName.length >= 30 || !/^[A-Za-z]+$/.test(user.firstName)) {
            return alert("First name must be between 1 and 30 character and include only uppercase and lowercase letters!")
        }
        if (user.lastName.length < 1 || user.lastName.length >= 30 || !/^[A-Za-z]+$/.test(user.lastName)) {
            return alert("last name must be between 1 and 30 character and include only uppercase and lowercase letters!")
        }
        if (user.phoneNumber.length !== 10 || !/^\d+$/.test(user.phoneNumber)) {
            return alert("Phone Number must be 10 digits and include only numbers!")
        }

        try {
            const res = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            const data = await res.json();
            if (res.ok) {
                alert("Registration successful!");
                auth.login(data.userId, data.token);
                navigate('/');
            } else {
                alert(`Error: ${data.message}`);
            }

        } catch (err) {
            console.error("Register failed:", err);
            alert("Something went wrong.");
        }
    }

    return (
        <>
            <section className="min-h-screen from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center">
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-4 lg:px-8">
                    <div className="bg-base-100 sm:mx-auto sm:w-full sm:max-w-xl">
                        <div className="w-full p-10 space-y-4 md:space-y-6 sm:p-10  rounded-2xl shadow-2xl border-2">
                            <h1 className="font-cubao mr-1 text-center">
                                Create Your TimeBuddy Account
                            </h1>
                            <form className="space-y-4 md:space-y-6" >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium "
                                    >
                                        Your email
                                    </label>
                                    <input
                                        type="email"
                                        value={user.email}
                                        onChange={updateUser('email')}
                                        name="email"
                                        id="email"
                                        placeholder="name@yahoo.com"
                                        className=" text-sm rounded-lg outline-1 focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="first-name" className="block text-sm/6 font-medium ">
                                            First name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="first-name"
                                                value={user.firstName}
                                                onChange={updateUser('firstName')}
                                                name="first-name"
                                                placeholder="John"
                                                type="text"
                                                autoComplete="given-name"
                                                className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1  focus:outline-2 focus:-outline-offset-2  sm:text-sm/6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="last-name" className="block text-sm/6 font-medium ">
                                            Last name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="last-name"
                                                value={user.lastName}
                                                onChange={updateUser('lastName')}
                                                name="last-name"
                                                placeholder="Doe"
                                                type="text"
                                                autoComplete="family-name"
                                                className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1  focus:outline-2 focus:-outline-offset-2  sm:text-sm/6"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block mb-2 text-sm font-medium "
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={user.phoneNumber}
                                        onChange={updateUser('phoneNumber')}
                                        name="phone"
                                        id=""
                                        placeholder="0823860543"
                                        className=" text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 outline-1 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="handle"
                                        className="block mb-2 text-sm font-medium "
                                    >
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        onChange={updateUser('username')}
                                        name="handle"
                                        id="handle"
                                        placeholder="Example: vektora8"
                                        className=" border   text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-2 text-sm font-medium "
                                    >
                                        Password
                                    </label>
                                    <input
                                        value={user.password}
                                        onChange={updateUser('password')}
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="••••••••"
                                        className=" text-sm rounded-lg focus:ring-primary-600 outline-1 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="photo"
                                        className="block mb-2 text-sm font-medium "
                                    >
                                        Profile Photo
                                    </label>
                                    <div className="flex flex-col items-center">
                                        <label
                                            htmlFor="photo"
                                            className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-400 rounded-full cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
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
                                    type="submit"
                                    // disabled={loading}
                                    onClick={register}
                                    className="btn btn-primary w-full bg-gradient-to-r py-3 px-4 rounded-xl font-bold text-lg shadow-lg transition-opacity duration-200 hover:opacity-80 active:scale-95"
                                >
                                    Create an account
                                </button>
                                <p className="text-base font-light  text-center">
                                    Already have an account?{" "}
                                    <span className="font-semibold  ">
                                        <NavLink to='/login'>Login here!</NavLink>
                                    </span>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}