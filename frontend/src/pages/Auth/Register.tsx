import { useState, ChangeEvent, FormEvent } from "react";
import { NavLink } from "react-router-dom";

interface UserRegister {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
    phoneNumber: string;
}

export function Register() {

    const [user, setUser] = useState<UserRegister>({
        username: '',
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        phoneNumber: ''
    });

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
        if (user.phoneNumber.length === 10 || !/^\d+$/.test(user.phoneNumber)) {
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
            } else {
                alert(`Error: ${data.message}`);
            }

        } catch (err) {
            console.error("Register failed:", err);
            alert("Something went wrong.");
        }
    }

    const updateUser = (prop: keyof UserRegister) => (e: ChangeEvent<HTMLInputElement>) => {
        setUser((prev) => ({
            ...prev,
            [prop]: e.target.value
        }));
    };


    return (
        <>
            <section className="min-h-screen bg-gradient-to-br from-emerald-100 via-lime-100 to-white flex items-center justify-center">
                <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-4 lg:px-8">
                    <div className="sm:mx-auto sm:w-full sm:max-w-xl">
                        <div className="w-full p-10 space-y-4 md:space-y-6 sm:p-10 bg-white/90 rounded-2xl shadow-2xl border-2 border-emerald-200">
                            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-emerald-700 md:text-4xl text-center">
                                Create Your Calendar Account
                            </h1>
                            <form className="space-y-4 md:space-y-6" >
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block mb-2 text-sm font-medium text-gray-900"
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-3">
                                        <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
                                            First name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="first-name"
                                                value={user.firstName}
                                                onChange={updateUser('firstName')}
                                                name="first-name"
                                                placeholder="Milko"
                                                type="text"
                                                autoComplete="given-name"
                                                className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
                                            Last name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="last-name"
                                                value={user.lastName}
                                                onChange={updateUser('lastName')}
                                                name="last-name"
                                                placeholder="Kalaidjiev"
                                                type="text"
                                                autoComplete="family-name"
                                                className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={user.phoneNumber}
                                        onChange={updateUser('phoneNumber')}
                                        name="phone"
                                        id=""
                                        placeholder="+3598238605432"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="handle"
                                        className="block mb-2 text-sm font-medium text-gray-900"
                                    >
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        value={user.username}
                                        onChange={updateUser('username')}
                                        name="handle"
                                        id="handle"
                                        placeholder="Example: mitkoPaynera"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block mb-2 text-sm font-medium text-gray-900"
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                {/* <div className="col-span-full">
                                    <label htmlFor="cover-photo" className="block text-base font-semibold text-emerald-700 mb-2">
                                        Profile Photo
                                    </label>
                                    <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-emerald-400 bg-emerald-50 px-6 py-10">
                                        <div className="text-center">
                                            <PhotoIcon aria-hidden="true" className="mx-auto size-16 text-emerald-300" />
                                            <div className="mt-4 flex text-base text-emerald-700">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer rounded-md bg-white font-semibold text-emerald-700 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-emerald-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="file-upload"
                                                        onChange={updateUser('photo')}
                                                        name="file-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-emerald-600">PNG, JPG, GIF up to 1MB</p>
                                        </div>
                                    </div>
                                </div> */}
                                {/* {user.photoBase64 && (
                                    <div className="mt-4 flex justify-center">
                                        <img
                                            src={user.photoBase64}
                                            alt="Preview"
                                            className="h-28 w-28 rounded-full object-cover border-4 border-emerald-300 shadow-lg"
                                        />
                                    </div>
                                )} */}

                                <button
                                    type="submit"
                                    // disabled={loading}
                                    onClick={register}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-lime-500 text-white py-3 px-4 rounded-xl font-bold text-lg shadow-lg transition-opacity "
                                >
                                    Create an account
                                </button>
                                <p className="text-base font-light text-gray-500 dark:text-gray-400 text-center">
                                    Already have an account?{" "}
                                    <span className="font-semibold text-emerald-700 hover:text-emerald-500">
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