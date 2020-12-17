const mongoose = require('mongoose')
const validator = require('validator')

const Task = new mongoose.model('task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    }
})

module.exports = Task