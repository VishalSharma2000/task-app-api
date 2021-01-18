const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

router.get('/me', async (req, res) => {
    // send only the user details which logged in 
    res.send(req.user);
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

router.patch('/me', async (req, res) => {
    const updates = Object.keys(req.body)       // extracting what updates user want to make
    const allowedUpdates = ['name', 'email', 'password', 'age']     // all the allowed updates
    // check if every element in updates is present in allowed updates, if any updates is not present then return false and break
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    // if the update user want to make is not present in allowed updates, then return 400 status code.
    if (!isValidOperation) return res.status('400').send('Specified field does not exist')

    try {
        /** Since, validation check does not happen automatically during update operation, runValidators: true, tell mongoose to run
         * all the validations functions wh en update operation is performed
         * new: true, return the updated document rather than returning original document
         */
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        /* Since, findByIdAndUpdate does not execute the middleware we have to change the way of updating a document. */

        const user = await User.findById(req.user._id);

        if (!user) {
            // user with specified id does not exist, return 404 page not found
            return res.status(404).send('Specified Id does not exist')
        }

        // update all the fields of the user
        updates.forEach((update) => user[update] = req.body[update]);        // bracket syntax for accessing object.
        await user.save();

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/me', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id)

        // Handle user not found
        if (!user) return res.status(404).send('User not found')

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/logout', async (req, res) => {
    try {
        // filter the user.token value in the database, such that the current token is removed.
        req.user.tokens = req.user.tokens.filter(({ token }) => (token != req.token));
        await req.user.save();

        res.status(200).send({ msg: "Logout successful" });
    } catch (e) {
        res.status(500).send(e);
    }
});

/* To logout user from all devices */
router.post('/logoutAll', async (req, res) => {
    try {
        req.user.tokens = [];
        delete req.token;
        await req.user.save();

        res.status(200).send({ msg: "Successfully Logout from all devices" });
    } catch (e) {
        req.status(500).send({ e });
    }
});

module.exports = router