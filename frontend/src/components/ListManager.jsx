import { useState } from 'react';
import api from '../services/api';
import TaskItem from './TaskItem';

function ListManager({ lists, tasks = [], onListsUpdated, onTaskComplete, onTaskDelete }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await api.post('/lists', { name });
            setName('');
            onListsUpdated?.();
        } catch (err) {
            setError(err.message || 'Failed to create list');
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (listId) => {
        if (!editName.trim()) return;
        setError('');
        setUpdatingId(listId);
        try {
            await api.put(`/lists/${listId}`, { name: editName.trim() });
            setEditingId(null);
            setEditName('');
            onListsUpdated?.();
        } catch (err) {
            setError(err.message || 'Failed to update list');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (listId) => {
        if (!window.confirm('Delete this list?')) return;
        setError('');
        setDeletingId(listId);
        try {
            await api.delete(`/lists/${listId}`);
            onListsUpdated?.();
        } catch (err) {
            setError(err.message || 'Failed to delete list');
        } finally {
            setDeletingId(null);
        }
    };

    const startEdit = (list) => {
        setEditingId(list._id);
        setEditName(list.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    return (
        <div className="card">
            <h3>Your lists</h3>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleCreate}>
                <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="New list name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                
                <button className="btn btn-primary" type="submit" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add list'}
                </button>
            </form>
            <div className="list-manager-items">
            {lists.length === 0 ? (
                <p className="empty-hint">No lists yet. Add one above.</p>
            ) : (
                <ul className="list-plain list-manager-lists">
                    {lists.map((list) => {
                        const listTasks = tasks.filter(
                            (task) => task.listId && String(task.listId) === String(list._id)
                        );
                        return (
                            <li key={list._id} className="list-manager-list-block">
                                <div className="list-item">
                                    {editingId === list._id ? (
                                        <div className="edit-row">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(list._id)}
                                            />
                                            <button type="button" className="btn btn-primary btn-sm" onClick={() => handleUpdate(list._id)} disabled={updatingId === list._id}>
                                                {updatingId === list._id ? 'Saving...' : 'Save'}
                                            </button>
                                            <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span>{list.name}</span>
                                            <div className="list-item-actions">
                                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => startEdit(list)}>Edit</button>
                                                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(list._id)} disabled={deletingId === list._id}>
                                                    {deletingId === list._id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                {listTasks.length > 0 && (
                                    <ul className="list-plain list-manager-tasks">
                                        {listTasks.map((task) => (
                                            <TaskItem
                                                key={task._id}
                                                task={task}
                                                onComplete={onTaskComplete}
                                                onDelete={onTaskDelete}
                                            />
                                        ))}
                                    </ul>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
            </div>
        </div>
    );
}

export default ListManager;