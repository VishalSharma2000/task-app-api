const express = require('express')
const router = express.Router();
const User = require('./../models/User');
const { findById } = require('./../models/User');
const { route } = require('./tasks');

router.post('/', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        res.status(201).send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})

router.post('/login', async (req, res) => {
    try {
        // Creating a own function in Model file
        const user = await User.findByCredentials(req.body.email, req.body.password);
        res.send(user)
    } catch (e) {
        res.status(400).send();
    }
})

router.get('/', async (req, res) => {
    try {
        res.status(200).send(await User.find({}))
    } catch (e) {
        res.status(500).send('Some error')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user) return res.status(404).send('Wrong id')

        res.status(200).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/:id', async (req, res) => {
    const updates = Object.keys(req.body)       // excluding what updates user want to make
    const allowedUpdates = ['name', 'email', 'password', 'age']     // all the allowed updates
    // check if every element in updates is present in allowed updates, if any updates is not present then return false and break
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))     

    // if the update user want to make is not present in allowed updates, then return 400 status code.
    if(!isValidOperation) return res.status('400').send('Specified field does not exist')

    try {
        /** Since, validation check does not happen automatically during update operation, runValidators: true, tell mongoose to run
         * all the validations functions when update operation is performed
         * new: true, return the updated document rather than returning original document
         */
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        /* Since, findByIdAndUpdate does not execute the middleware we have to change the way of updating a document. */

        const user = await User.findById(req.params.id);

        if(!user) {
            // user with specified id does not exist, return 404 page not found
            return res.status(404).send('Specified Id does not exist')
        }

        // update all the fields of the user
        updates.forEach((update) => user[update] = req.body[update]);        // bracket syntax for accessing object.
        await user.save();

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        // Handle user not found
        if(!user) return res.status(404).send('User not found')

        res.send(user)
    } catch(e) {
        res.status(400).send(e)
    }
})

module.exports = router