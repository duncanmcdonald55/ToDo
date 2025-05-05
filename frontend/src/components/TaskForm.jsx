import {useState} from 'react';

export default function TaskForm({onTaskAdded}) {
    const [taskData, setTaskData] = useState({'task_name': "", 'duedate': ""});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        setTaskData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventdefault();
        setIsSubmitting(true);
        setIsError("");

        try {
            const response = await fetch('/api/tasks', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Failed to add Task");
            }

            setTaskData({ 'task_name': "", "duedate": ""});

            if (onTaskAdded) {
                onTaskAdded();
            }
        } catch (err) {
            setIsError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className = "mb-6">
            <h3 className = "text-lg font-semibold mb-2">Add New Task</h3>

            {isError && (
                <div className ="p-2 mb-4 bg-red-100 text-red-700 rounded text-sm">

                    {isError}
                </div>
            )}

            <form onSubmit={handleSubmit} className = "flex flex-col md:flex-row gap-2">
                <input 
                    name = 'task_name'
                    id = 'task_name'
                    placeholder='Task Name'
                    type = 'text'
                    required
                    onChange = {handleChange}
                    value = {taskData.task_name}
                    className = "flex-1 px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                    name = 'duedate'
                    id = 'duedate'
                    type = 'date'
                    required
                    value = {taskData.duedate}
                    onChange = {handleChange}
                    className = "px-3 py-2 border border-gray-300 rounded-md"
                />
                <button type = "submit" disabled = {isSubmitting} className = "px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
                    {isSubmitting ? 'Adding...': 'Add Task'}
                </button>
            </form>
        </div>         
    );
}