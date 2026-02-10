import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [tasksError, setTasksError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setTasksError('');
                setLoadingTasks(true);

                console.log('Fetching tasks...');
                const { data } = await api.get('/tasks');
                console.log('Tasks response:', data);

                setTasks(data);
            } catch(err) {
                setTasksError(err.response?.data?.error || 'Failed to load tasks');
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Welcome, {user?.name || user?.email}!</p>
            <button onClick={handleLogout}>Logout</button>

            <hr />

            <h2>Your Tasks</h2>
            {loadingTasks && <p>Loading tasks...</p>}
            {tasksError && <p style={{ color: 'red' }}>{tasksError}</p>}

            {!loadingTasks && !tasksError && (
                <>
                    {tasks.length === 0 ? (
                        <p>No tasks yet.</p>
                    ) : (
                        <ul>
                            {tasks.map((task) => (
                                <li key={task._id}>
                                    <strong>{task.title}</strong>{' '}
                                    {task.completed ? '(Done)' : '(Pending)'}
                                </li>
                                ))}
                        </ul>
                    )}
                </>
            )}
        </div>
    );
}

export default Dashboard;