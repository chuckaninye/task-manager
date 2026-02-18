import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from './models/user.js';
import TaskModel from './models/task.js';
import ListModel from './models/list.js';
import WorkspaceModel from './models/workspace.js';
import cors from 'cors';

dotenv.config();
const app = express();
mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 3000;
const CONNECTION = process.env.CONNECTION;

app.use(express.json());
app.use(cors({
    origin: [
        'https://tidy-task-manager.netlify.app',
        'http://localhost:5173'
    ],
    credentials: true
}));

const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

app.get('/', (req, res) => {
    res.send('API is working!');
});


app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserModel.create({
            email,
            password: hashedPassword,
            name,
            createdAt: new Date()
        });

        res.json({ message: 'User registered successfully' })
    }
    catch (err) {
        res.status(400).json({ error: err.message })
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or address' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (isValidPassword) {
            const token = generateToken(user._id);

            res.json({
                message: 'Login successful',
                token,
                user: { id: user._id, email: user.email, name: user.name }
            })
        } else {
            return res.status(401).json({ error: 'Invalid email or address' });
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        req.user = user;
        next();
    })
};

app.get('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const tasks = await TaskModel.find({ userId })
        res.json(tasks)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.userId;

        const task = await TaskModel.findOne({ _id: taskId, userId });

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json(task);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title, description, dueDate, priority, listId } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (!listId) {
            return res.status(400).json({ error: 'List ID is required' });
        }

        const task = await TaskModel.create({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            priority,
            userId,
            listId,
            createdAt: new Date()
        });

        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.userId;

        const task = await TaskModel.findById(taskId);

        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }

        if (task.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this task' });
        }

        const updatedTask = await TaskModel.findByIdAndUpdate(
            taskId,
            {
                ...req.body,
                dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
            },
            { new: true, runValidators: true }
        );

        res.json(updatedTask);
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.userId;

        const task = await TaskModel.findOne({ _id: taskId, userId });

        if (!task) {
            return res.status(400).json({ error: 'Task not found or not authorized' });
        }

        await TaskModel.findByIdAndDelete(taskId);

        res.json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

app.get('/api/lists', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const query = { userId };

        const lists = await ListModel.find(query);
        res.json(lists);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/lists/:id', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.id;
        const userId = req.user.userId;

        const list = await ListModel.findOne({ _id: listId, userId });

        if (!list) {
            return res.status(404).json({ error: 'List not found' })
        }

        res.json(list)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
});

app.post('/api/lists', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, workspaceId } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'List name is required' })
        }

        const list = await ListModel.create({
            name,
            userId,
            workspaceId: workspaceId || undefined,
            createdAt: new Date()
        });

        res.status(201).json(list);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/lists/:id', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.id;
        const userId = req.user.userId;
        const { name, workspaceId } = req.body;

        const list = await ListModel.findById(listId);

        if (!list) {
            return res.status(404).json({ error: 'List not found' });
        }

        if (list.userId.toString() !== userId) {
            return res.status(403).json({ error: 'Not authorized to update this list' });
        }

        const updatedList = await ListModel.findByIdAndUpdate(
            listId,
            {
                ...(name && { name }),
                ...(workspaceId !== undefined && { workspaceId })
            },
            { new: true, runValidators: true }
        );

        res.json(updatedList);
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
});

app.delete('/api/lists/:id', authenticateToken, async (req, res) => {
    try {
        const listId = req.params.id;
        const userId = req.user.userId;

        const list = await ListModel.findOne({ _id: listId, userId });

        if (!list) {
            return res.status(404).json({ error: 'List not found or not authorized' });
        }

        await ListModel.findByIdAndDelete(listId);

        res.json({ message: 'List deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/workspaces', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;

        const workspaces = await WorkspaceModel.find({
            $or: [
                { ownerID: userId },
                { members: userId }
            ]
        });

        res.json(workspaces);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
})

app.get('/api/workspaces/:id', authenticateToken, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.userId;

        const workspace = await WorkspaceModel.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        const isOwner = workspace.ownerId.toString() === userId;
        const isMember = workspace.members.some(member => member.toString() === userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ error: 'Not authorized to view this workspace' });
        }

        res.json(workspace);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workspaces', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const { name, members } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Workspace name is required' });
        }

        const workspace = await WorkspaceModel.create({
            name,
            ownerId: userId,
            members: members || [],
            createdAt: new Date()
        });

        res.status(201).json(workspace);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/workspaces/:id', authenticateToken, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.userId;
        const { name, members } = req.body;

        const workspace = await WorkspaceModel.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (workspace.ownerId.toString() !== userId) {
            return res.status(403).json({ error: 'Only workspace owner can update' });
        }

        const updatedWorkspace = await WorkspaceModel.findByIdAndUpdate(
            workspaceId,
            {
                ...(name && { name }),
                ...(members !== undefined && { members })
            },
            { new: true, runValidators: true }
        );

        res.json(updatedWorkspace);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/workspaces/:id', authenticateToken, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.userId;

        const workspace = await WorkspaceModel.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (workspace.ownerId.toString() !== userId) {
            return res.status(403).json({ error: 'Only workspace owner can delete' });
        }

        await WorkspaceModel.findByIdAndDelete(workspaceId);

        res.json({ message: 'Workspace deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workspaces/:id/members', authenticateToken, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const userId = req.user.userId;
        const { memberId } = req.body;

        if (!memberId) {
            return res.status(400).json({ error: 'Member ID is required' });
        }

        const workspace = await WorkspaceModel.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (workspace.ownerId.toString() !== userId) {
            return res.status(403).json({ error: 'Only workspace owner can add members' });
        }

        if (workspace.members.includes(memberId)) {
            return res.status(400).json({ error: 'User is already a member' });
        }

        workspace.members.push(memberId);
        await workspace.save();

        res.json(workspace);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/workspaces/:id/members/:memberId', authenticateToken, async (req, res) => {
    try {
        const workspaceId = req.params.id;
        const memberId = req.params.memberId;
        const userId = req.user.userId;

        const workspace = await WorkspaceModel.findById(workspaceId);

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        if (workspace.ownerId.toString() !== userId) {
            return res.status(403).json({ error: 'Only workspace owner can remove members' });
        }

        workspace.members = workspace.members.filter(
            member => member.toString() !== memberId
        );
        await workspace.save();

        res.json(workspace);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

const run = async () => {
    try {
        await mongoose.connect(CONNECTION);

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.log(err.message);
    }
}

run();