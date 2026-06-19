const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    title: { type: String, required: [true, 'Task title is required'] },
    description: { 
        type: String, 
        required: [true, 'Task description is required'],
        minlength: [20, 'Description must be at least 20 characters long']
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed'], 
        default: 'Pending' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);