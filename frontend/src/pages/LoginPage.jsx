import {useState} from 'react';
import {useNavigate, Link} from 'react-router-dom';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        firstname: "",
        password: ""
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch('/api/login', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error (data.Error || "Login failed");
            }

            navigate('/manage');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className = "flex min-h-screen items-center justify-center">
            <div className = "w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className = "text-center">
                    <h1 className = "text-2xl font-bold">Login to MyHabit</h1>
                    <p className = "mt-2 text-gray-600">Track your habits and tasks</p>
                </div>

                {error && (
                    <div className = "p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form className = "mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor = "firstname" className = "block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input 
                            id="firstname"
                            name = "firstname"
                            type="text"
                            required
                            value = {formData.firstname}
                            onChange = {handleChange}
                            className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor ="password" className = "block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input 
                            id="password"
                            name = "password"
                            type="password"
                            required
                            value = {formData.password}
                            onChange = {handleChange}
                            className="mt-1 block w-full px-3 py-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <button type = "submit" disabled = {isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Logging in...': 'Login'}
                        </button>
                    </div>

                    <div className ='text-indigo-600 hover:text-indigo-800'>
                        <p>
                            Don't have an account?{" "}
                            <Link to='/register' className='text-indigo-600 hover:text-indigo-800'>
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
