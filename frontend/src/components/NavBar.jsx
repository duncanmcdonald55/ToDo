import {useNavigate} from 'react-router-dom';

export default function NavBar() {
    const navigate = useNavigate();

    const handleLogout = async (e) => {

        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                navigate('/login');
            } else {
                console.error("Error logging out");
            }
            
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <nav className = "bg-indigo-600 text-white p-4">
            <div className = "container mx-auto flex justify-between items-center">
                <div className = 'font-bold text-xl'>MyHabit</div>
                <div>
                    <button
                        onClick = {handleLogout}
                        className = "bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded text-sm"
                    >
                        Logout
                    </button>
                </div>

            </div>
        </nav>
    );
}
