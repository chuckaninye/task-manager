import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import ListManager from '../components/ListManager';

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(true);
    const [tasksError, setTasksError] = useState('');
    const [lists, setLists] = useState([]);
    const [listsLoading, setListsLoading] = useState(true);
    const [listsError, setListsError] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setTasksError('');
                setLoadingTasks(true);

                const { data } = await api.get('/tasks');

                setTasks(data);
            } catch (err) {
                setTasksError(err.response?.data?.error || 'Failed to load tasks');
            } finally {
                setLoadingTasks(false);
            }
        };

        fetchTasks();
        fetchLists();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const fetchTasks = async () => {
        try {
            setTasksError('');
            setLoadingTasks(true);
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (err) {
            setTasksError(err.response?.data?.error || 'Failed to load tasks');
        } finally {
            setLoadingTasks(false);
        }
    };

    const fetchLists = async () => {
        try {
            setListsError('');
            setListsLoading(true);
            const { data } = await api.get('/lists');
            setLists(data);
        } catch (err) {
            setListsError(err.message || 'Failed to load lists');
        } finally {
            setListsLoading(false);
        }
    };

    return (
        <div className="app-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="dashboard-welcome">Welcome, {user?.name || user?.email}!</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Logout</button>
            </div>

            <hr />

            {listsLoading && <p className="loading">Loading lists...</p>}
            {listsError && <p className="error">{listsError}</p>}
            {!listsLoading && !listsError && (
                <ListManager
                    lists={lists}
                    tasks={tasks}
                    onListsUpdated={fetchLists}
                    onTaskComplete={async (task) => {
                        try {
                            await api.put(`/tasks/${task._id}`, { completed: !task.completed });
                            const { data } = await api.get('/tasks');
                            setTasks(data);
                        } catch (err) {
                            setTasksError(err.response?.data?.error || 'Failed to update task');
                        }
                    }}
                    onTaskDelete={async (task) => {
                        if (!window.confirm('Delete this task?')) return;
                        try {
                            await api.delete(`/tasks/${task._id}`);
                            const { data } = await api.get('/tasks');
                            setTasks(data);
                        } catch (err) {
                            setTasksError(err.response?.data?.error || 'Failed to delete task');
                        }
                    }}
                />
            )}

            <hr />

            <CreateTaskForm lists={lists} onTaskCreated={fetchTasks} />

            <hr />

            <h2 className="section-title">Your Tasks</h2>
            <div className="card">
            <TaskList
                tasks={tasks}
                loading={loadingTasks}
                error={tasksError}
                onTaskComplete={async (task) => {
                    try {
                        await api.put(`/tasks/${task._id}`, { completed: !task.completed });
                        const { data } = await api.get('/tasks');
                        setTasks(data);
                    } catch (err) {
                        setTasksError(err.response?.data?.error || 'Failed to update task');
                    }
                }}
                onTaskDelete={async (task) => {
                    if (!window.confirm('Delete this task?')) return;
                    try {
                        await api.delete(`/tasks/${task._id}`);
                        const { data } = await api.get('/tasks');
                        setTasks(data);
                    } catch (err) {
                        setTasksError(err.response?.data?.error || 'Failed to delete task');
                    }
                }}
            />
            </div>
        </div>
    );
}

export default Dashboard;