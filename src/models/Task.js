const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"  // should be same as user model name
    }
}, {
    timestamps: true,
})

const Task = new mongoose.model('task', taskSchema);

module.exports = Task