import {useState, useEffect} from 'react';
import {useNavigate, Link} from 'react-router-dom';



function checkValidation() {
    const navigate = useNavigate();
    useEffect(() => {
        fetch('/api/session', {
            'credentials': 'include'
        }).then(res => res.json())
        .then(data => {
            if (!data.error) {
                navigate('/manage');
            }
        })
        .catch(err => console.error("Session check error:", err));
    }, [navigate]);
}

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstname: "",
        email: "",
        password: "",
        confirmation: ""
    });
    const [error, setError] = useState("")
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

        if (formData.password !== formData.confirmation) {

            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch('/api/register', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)

            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error (data.error || "Could not register ");
            }
            navigate('/login')

        } catch (err) {
            setError(err.message)
        }
        finally {
            setIsLoading(false)
        }
    };

    return (
        <div className = "flex min-h-screen items-center justify-center">
            <div className = "w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className = "text-center">
                    <h1 className = "text-2xl font-bold">Register to MyHabit</h1>
                    <p className = "mt-2 text-gray-600">Track your habits and tasks</p>
                </div>

                {error && (
                    <div className='p-3 bg-red-100 text-red-700 rounded'>
                        {error}
                    </div>
                )}

                <form className = "mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor = "firstname" className='block text-sm font-medium text-gray-700'>
                            Username
                        </label>
                        <input
                            name='firstname'
                            id='firstname'
                            placeholder='firstname'
                            type = 'text'
                            required
                            value = {formData.firstname}
                            onChange={handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />         
                    </div>

                    <div>
                        <label htmlFor = "email" className = 'block text-sm font-medium text-gray-700'>
                            Email
                        </label>
                        <input 
                            name='email'
                            id = 'email'
                            placeholder='email'
                            type = 'email'
                            required
                            value = {formData.email}
                            onChange = {handleChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label htmlFor = "password" className = 'block text-sm font-medium text-gray-700'>
                            Password
                        </label>
                        <input
                            name = 'password'
                            id = 'password'
                            placeholder = 'password'
                            type = 'password'
                            required
                            autoComplete = 'off'
                            value = {formData.password}
                            onChange = {handleChange}
                            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                    </div>

                    <div>
                        <label htmlFor = 'confirmation' className = 'block text-sm font-medium text-gray-700'>
                            Confirmation
                        </label>

                        <input
                            name = 'confirmation'
                            id = 'confirmation'
                            placeholder = 'Confirmation'
                            type = 'password'
                            required
                            autoComplete='off'
                            value = {formData.confirmation}
                            onChange = {handleChange}
                            className = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
                        />
                    </div>

                    <div>
                        <button type="submit" disabled = {isLoading} className ="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {isLoading ? 'Logging in ...': 'Register'}
                        </button>
                    </div>
                    <div>
                        <p>
                            Already have an account?{" "}
                            <Link to='/login' className = 'text-indigo-600 hover:text-indigo-800'>
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}