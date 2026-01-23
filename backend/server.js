import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserModel from './models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
mongoose.set('strictQuery', false);
const PORT = process.env.PORT || 3000;
const CONNECTION = process.env.CONNECTION;

app.use(express.json());

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
            createdAt: Date()
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

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or address' });
        }

        if (isValidPassword) {
            const token = generateToken(user._id);

            res.json({
                message: 'Login successful',
                token,
                user: { id: user._id, email: user.email, name: user.name }
            })
        } else {
            res.status(401).json({ error: 'Invalid credentials' })
        }

    } catch (err) {
        res.status(500).json({ error: err.message });
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