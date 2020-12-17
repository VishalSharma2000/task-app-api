const express = require('express')
const router = express.Router()
const Task = require('./../models/Task')

router.post('/', async (req, res) => {
    const task = new Task(req.body)

    try {
        await task.save()       // save task to db

        res.status(201).send(task)      
    } catch(e) {
        res.status(400).send(e)
    }
})

router.get('/', async (req, res) => {
    try {
        // fetch all uncompletedTask from db
        const uncompletedTask = await Task.find({completed: false})

        // All task completed, return 
        if(!uncompletedTask.length) return res.send('All Task Completed')
        
        res.send(uncompletedTask)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.patch('/:id', async (req, res) => {
    // refer patch request for users
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send('Given field does not exist')

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        const task = await Task.findById(req.params.id);

        if(!task) {
            // Handle Task not found
            return res.status(404).send('Task does not exist')
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task)
    } catch(e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if(!task) return res.status(404).send('Task Not found')

        res.send(task)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router