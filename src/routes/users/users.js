const express = require('express');
const multer = require('multer');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1024 * 1024 // should be in bytes
    },
    fileFilter(req, file, cb) {
        let fileName = file.originalname;

        // $ is used to say that the value should be at end.
        if (!fileName.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File not supported'))
        }

        cb(undefined, 'File upload Successfully');
    }
})

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
  });
  
router.get('/:id/avatar', async (req, res) => {
try {
    const user = await User.findById(req.params.id);

    if(!user || !user.avatar) {
    throw new Error({
        message: "Avatar does not exist"
    })
    }

    res.set('Content-Type', 'image/jpg');
    res.status(200).send(user.avatar);
} catch (e) {

}
});

/* 
When the used middleware throws a error, we can use a 4th argument in the route for handling the error.
But the format of the 4th argument(callback function) should be properly matched. (error, req, res, next)

Note: if the dest key is not specified in the multer config, then we will be able to access the uploaded file's buffer in req.file
otherwise we won't be able to access the buffer file
*/
// upload user profile
router.route('/me/avatar')
    .post(upload.single('avatar'), async (req, res) => {
        req.user.avatar = req.file.buffer;
        await req.user.save();

        res.send();
    }, (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    })
    .delete(async (req, res) => {
        req.user.avatar = undefined;

        await req.user.save();
        res.json({
            error: false,
            message: "Avatar deleted succesfully"
        });
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