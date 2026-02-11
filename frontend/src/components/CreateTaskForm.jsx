import { useState, useEffect } from 'react';
import api from '../services/api';

function CreateTaskForm({ onTaskCreated, lists: listsProp }) {
    const [listsState, setListsState] = useState([]);
    const [loadingLists, setLoadingLists] = useState(true);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [priority, setPriority] = useState('medium');
    const [listId, setListId] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const lists = listsProp !== undefined ? listsProp : listsState;

    useEffect(() => {
        if (listsProp !== undefined) {
            setLoadingLists(false);
            return;
        }
        const fetchLists = async () => {
            try {
                const { data } = await api.get('/lists');
                setListsState(data);
                if (data.length > 0 && !listId) setListId(data[0]._id);
            } catch (err) {
                setError(err.message || 'Failed to load lists');
            } finally {
                setLoadingLists(false);
            }
        };
        fetchLists();
    }, [listsProp]);

    useEffect(() => {
        if (lists.length > 0 && !listId) setListId(lists[0]._id);
    }, [lists, listId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/tasks', {
                title,
                description: description || undefined,
                dueDate: dueDate || undefined,
                priority,
                listId,
            });
            setTitle('');
            setDescription('');
            setDueDate('');
            setPriority('medium');
            if (lists.length > 0) setListId(lists[0]._id);
            onTaskCreated?.();
        } catch (err) {
            setError(err.message || 'Failed to create task');
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingLists) return <div className="card"><p className="loading">Loading lists...</p></div>;

    if (lists.length === 0) {
        return <div className="card"><p className="empty-hint">Create a list first before adding tasks.</p></div>;
    }

    return (
        <div className="card">
            <form onSubmit={handleSubmit}>
                <h3>Add task</h3>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label htmlFor="task-title">Title</label>
                    <input
                        id="task-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="task-description">Description</label>
                    <input
                        id="task-description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="task-list">List</label>
                    <select
                        id="task-list"
                        value={listId}
                        onChange={(e) => setListId(e.target.value)}
                        required
                    >
                        {lists.map((list) => (
                            <option key={list._id} value={list._id}>
                                {list.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="task-priority">Priority</label>
                    <select
                        id="task-priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="task-due">Due date</label>
                    <input
                        id="task-due"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add task'}
                </button>
            </form>
        </div>
    );
}

export default CreateTaskForm;