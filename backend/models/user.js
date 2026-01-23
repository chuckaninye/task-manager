import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    createdAt: Date
})

export default mongoose.model('User', userSchema);