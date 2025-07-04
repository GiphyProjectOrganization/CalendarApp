import { useState, ChangeEvent, FormEvent, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/contexts/authContext/authContext";

interface UserLogin {
    password: string;
    email: string;
}

interface LoginResponse {
    userId: string;
    token: string;
}

export default function LoginPage() {

    const [user, setUser] = useState<UserLogin>({
        email: '',
        password: ''
    });

    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const logIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user.email || !user.password) {
            return alert("Please enter an email and password");
        }

        if (!/\d/.test(user.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(user.password)) {
            return alert("Password must have one number and one symbol!")
        }

        try {
            const res = await fetch('http://localhost:5000/api/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            const data = await res.json();
            if (data.isBlocked) {
                alert('Your account is blocked')
                return
            }
            if (res.ok) {
                // Pass undefined for expirationDate, then isAdmin, then isBlocked
                auth.login(data.userId, data.token, user.email, data.profilePhoto, undefined, data.isAdmin, data.isBlocked);
                navigate('/')
            } else {
                alert(data.message || `Login failed`);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong ')
        }
    }

    const updateUser = (prop: keyof UserLogin) => (e: ChangeEvent<HTMLInputElement>) => {
        setUser({
            ...user,
            [prop]: e.target.value
        });
    }

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center  from-primary/10 via-secondary/10 to-accent/10 px-6 py-12 lg:px-8">
                <div className="bg-base-100 max-w-lg w-full mx-auto rounded-2xl shadow-xl border border-primary/20 p-6">
                    <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                        <h2 className="font-cubao mr-1 text-center">
                            Sign in to your account
                        </h2>
                    </div>

                    <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-sm">
                        <form className="space-y-6" onSubmit={logIn}>
                            <div>
                                <label htmlFor="email" className="block text-sm/6 font-medium ">
                                    Email address
                                </label>
                                <div className="mt-2">
                                    <input
                                        id="email"
                                        value={user.email} onChange={updateUser('email')}
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        required
                                        autoComplete="email"
                                        className="block w-full rounded-md  px-3 py-1.5 text-base outline-1 -outline-offset-1  focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password" className="block text-sm/6 font-medium">
                                        Password
                                    </label>
                                </div>
                                <div className="mt-2">
                                    <input
                                        id="password"
                                        value={user.password} onChange={updateUser('password')}
                                        name="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        required
                                        autoComplete="current-password"
                                        className="block w-full rounded-md  px-3 py-1.5 text-base outline-1 -outline-offset-1  focus:outline-2 focus:-outline-offset-2  sm:text-sm/6"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    className="btn btn-primary w-full bg-gradient-to-r py-3 px-4 rounded-xl font-bold text-lg shadow-lg transition-opacity duration-200 hover:opacity-80 active:scale-95"
                                >
                                    Sign in
                                </button>

                            </div>
                        </form>

                        <p className="mt-10 text-center text-sm/6 ">
                            Don't have account?{' '}
                            <a href="#" className="font-semibold ">
                                <NavLink to="/register">Register here!</NavLink>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
