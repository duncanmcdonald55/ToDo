import { useEffect, useState } from "react";
import NavBar from '../components/NavBar';
import TaskForm from "../components/TaskForm";
import HabitForm from "../components/HabitForm";

export default function ManagePage() {
    const [tasks, setTasks] = useState([]);
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthenticated] = useState(false);

    const fetchData = () => {
        setIsLoading(true);

        fetch('/api/session', {
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) { 
                return res.json().then(data => Promise.reject(data));
            }
            return res.json();
        })
        .then(data => {
            console.log("User is logged In", data)
            setIsAuthenticated(true);
        

            return Promise.all([
                fetch('/api/tasks', { credentials: 'include' })
                    .then(res => {
                        if (!res.ok) throw new Error ('Error rendering tasks');
                        return res.json();
                    }),

                fetch('/api/habits', {
                    credentials: 'include'
                }).then(res => {
                    if (!res.ok) throw new Error ('Error rendering habits');
                    return res.json();
                })  
            ]);
        })
        .then(([tasksData, habitsData]) => {
            setTasks(tasksData);
            setHabits(habitsData);
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Error fetching data", err);
            setError(err.message);
            setIsAuthenticated(false)
            setError("User not authenticated")
            setIsLoading(false);
        });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const deleteItem = (type, name) => {
        fetch(`api/${type}/${name}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) { 
                throw new Error (`Error in deletion of ${type} item`); 
            }
            if (type === 'tasks') {
                setTasks(tasks.filter(t => t.task_name !== name));
            } else {
                setHabits(habits.filter(h => h.habitname !== name));
            }
        })  
        .catch(error => {
            console.error("Error deleting item", error);
            setError(error.message);
        });
    };

    if (isLoading) return <div>Loading ...</div>;

    if (error) {
        if (error === "Not authenticated") {
            return (
                <div className = "p-4 text-center">
                    <h2 className = "text-xl font-bold text-red-500">Authentication Required</h2>
                    <p>Please log in to view your tasks and habits</p>
                </div>
            );
        }
        return (
            <div className = "p-4 text-center">
                <h2 className = "text-xl font-bold text-red-500">Error</h2>
                <p>{error}</p>
            </div>
        );
    }
    return (
        <div className = "min-h-screen flex flex-col">
            <NavBar />
            <div className = "container mx-auto p-4">
            <h1 className = "text-2xl font-bold mb-4">My Habits & Tasks</h1>

            <section className = "mb-6">
                <h2 className = "text-xl font-bold mb-2">Tasks</h2>
                <TaskForm onTaskAdded={fetchData} />
                {tasks.length === 0 ? (
                    <p>No tasks available</p>
                ) : (
                    <ul className = "space-y-2">
                        {tasks.map(task => (
                            <li key = {task.taskid || task.task_name} className = "flex justify-between items-center border p-2 rounded">
                                <div className = "text-left">
                                    <span className = 'font-medium'>{task.task_name}</span>
                                    {task.duedate && (
                                        <div className = "text-sm text-gray-600">
                                            Due: {new Date(task.duedate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteItem('tasks', task.task_name)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                        Delete
                                    </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <h2 className = "text-2xl font-bold mb-2">Habits</h2>
                <HabitForm onHabitAdded={fetchData} />
                {habits.length === 0 ? (
                    <p>No habits available</p>
                ) : (
                    <ul className = "space-y-2">
                        {habits.map(habit => (
                            <li key={habit.habitid || habit.habitname} className = "flex justify-between items-center border p-2 rounded">
                                <div className = "text-left">
                                    <span className = 'font-medium'>{habit.habitname}</span>
                                    <div className = "text-sm text-gray-600">
                                        <span>Frequency: {habit.hfrequency}</span>
                                        {habit.hduration && <span> • Duration: {habit.hduration} mins</span>}
                                    </div>
                                </div>
                                <button 
                                    onClick = {() => deleteItem('habits', habit.habitname)}
                                    className = "bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                        Delete Habit
                                </button>
                            </li>
                        ))}
                    </ul>
                
                )}
            </section>
            </div>
        </div>

    );
    }
