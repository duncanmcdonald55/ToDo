import { useState } from 'react';

export default function HabitForm({onHabitAdded}) {
    const [habit, addHabit] = useState({"habitname": "", "hfrequency": "daily", "hduration": 15});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState("");

    const handleChange = (e) => {
        const {name, value} = e.target;
        addHabit(prev => ({
            ...prev,
            [name]: name === 'hduration' ? parseInt(value) || '' : value
        }));

    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setIsError("");

        try {
            const response = await fetch('/api/habits', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(habit)
            });

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || "Couldn't load Habit Correctly")
            }

            addHabit({"habitname": "", "hfrequency": "daily", "hduration": 15});

            if (onHabitAdded) {
                onHabitAdded();
            } 
        } catch (err) {
            console.error('Form submission error:',err);
            setIsError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className = 'mb-6'>
            <h3 className = "text-lg font-semibold mb-2">Add new Habit</h3>

            {isError && (
                <div className = "p-2 mb-4 bg-red-100 text-red-700 rounded text-sm">
                    {isError}
                </div>
            )}

            <form onSubmit = {handleSubmit} className = "flex flex-col md:flex-row gap-2">
                <div className = "flex flex-col md:flex-row gap-2">
                    <input
                        name = "habitname"
                        id = "habitname"
                        placeholder='Habit Name'
                        type = "text"
                        required
                        onChange={handleChange}
                        value = {habit.habitname}
                        className = "flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />

                    <select name = "hfrequency" value = {habit.hfrequency} onChange={handleChange} className = "px-3 py-2 border border-gray-300 rounded-md">
                        <option value='daily'>Daily</option>
                        <option value='weekly'>Weekly</option>
                        <option value='monthly'>Monthly</option>
                    </select>
                </div>

                <div className = "flex items-center">
                    <label htmlFor = "hduration" className = "mr-2 whitespace-nowrap">
                        Duration: (mins)
                    </label>
                    <input 
                        type = "number"
                        name = 'hduration'
                        id = 'hduration'
                        min = '1'
                        onChange={handleChange}
                        value = {habit.hduration}
                        className = "w-20 px-3 py-2 border border-gray-300 rounded-md"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled = {isSubmitting} 
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isSubmitting ? 'Adding...': 'Add Habit'}
                </button>
            </form>
        </div>    
    );
}