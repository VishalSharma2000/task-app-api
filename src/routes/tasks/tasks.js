const express = require('express')
const router = express.Router()
const Task = require('../../models/Task')

router.post('/', async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save()       // save task to db

        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// fetch all tasks
// /tasks?completed=false
// /tasks?limit=10&skip=6
// /tasks?sortBy=createdBy&order=asc
router.get('/', async (req, res) => {
    const { completed, limit, skip, sortBy, order } = req.query;

    let match = {};
    match.owner = req.user._id;

    if(completed) 
        match.completed = completed === 'true' ? true : false;

    let query = Task.find(match);
    if(limit) query.limit(parseInt(limit));
    if(skip) query.skip(parseInt(skip));
    if(sortBy) query.sort({ [sortBy]: order === 'desc' ? -1 : 1 })


    try {
        const tasks = await query;

        res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send(e)
    }
})

// to fetch a particular task
router.get('/:id', async (req, res) => {
    const { id: _id } = req.params;
    const { user } = req;

    try {
        const task = await Task.findOne({ _id, owner: user._id });

        if(!task) 
            return res.status(404).json({ msg: "Task not found"});
        
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
});

// update a specific task
router.patch('/:id', async (req, res) => {
    // refer patch request for users
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) return res.status(400).send('Given field does not exist')

    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true})

        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            // Handle Task not found
            return res.status(404).send('Task does not exist')
        }

        updates.forEach((update) => task[update] = req.body[update]);
        await task.save();
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

        if (!task) 
            return res.status(404).json({
                error: true,
                message: "Task not found"
            })

        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router