function TaskItem({ task, onComplete, onDelete }) {
    const dueDateStr = task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : null;

    return (
        <li className={`task-item ${task.completed ? 'completed' : ''}`}>
            <input
                type="checkbox"
                checked={task.completed || false}
                onChange={() => onComplete?.(task)}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
            />
            <div className="task-item-body">
                <strong>{task.title}</strong>
                {task.description && <p>{task.description}</p>}
                <div className="task-item-meta">
                    {task.priority && <span>Priority: {task.priority}</span>}
                    {dueDateStr && <span>Due: {dueDateStr}</span>}
                </div>
            </div>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete?.(task)}>
                Delete
            </button>
        </li>
    );
}

export default TaskItem;