import TaskItem from './TaskItem';

function TaskList({ tasks, loading, error, onTaskComplete, onTaskDelete }) {
    if (loading) return <p className="loading">Loading tasks...</p>;
    if (error) return <p className="error">{error}</p>;
    if (!tasks || tasks.length === 0) return <p className="empty-hint">No tasks yet. Create one to get started.</p>;

    return (
        <ul className="list-plain">
            {tasks.map((task) => (
                <TaskItem
                    key={task._id}
                    task={task}
                    onComplete={onTaskComplete}
                    onDelete={onTaskDelete}
                />
            ))}
        </ul>
    );
}

export default TaskList;