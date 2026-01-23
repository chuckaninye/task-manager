import mongoose from "mongoose";

const listSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: false },
    createdAt: Date
})

export default mongoose.model('List', listSchema);