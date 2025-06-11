// phone, first name, last name 
export function EditProfile() {
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className=" rounded-2xl shadow-xl border p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Edit Profile</h2>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="firstName">First Name</label>
                        <input
                            id="firstName"
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 "
                            placeholder="Enter first name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="lastName">Last Name</label>
                        <input
                            id="lastName"
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 "
                            placeholder="Enter last name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1" htmlFor="phone">Phone</label>
                        <input
                            id="phone"
                            type="tel"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 "
                            placeholder="Enter phone number"
                        />
                    </div>
                    <button
                        className="px-5 py-2 rounded-lg outline-1 font-bold transition-transform duration-200 hover:scale-110"
                        type="button">
                        Edit
                    </button>
                </form>
            </div>
        </div>
    )
}