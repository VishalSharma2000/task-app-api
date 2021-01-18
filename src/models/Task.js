const mongoose = require('mongoose')
const validator = require('validator')

const Task = new mongoose.model('task', {
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
})

module.exports = Task