require('dotenv').config();
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { PRIVATE_KEY_JWT } = process.env;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password'))
                throw new Error('Password should not contain password keyword')
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0)
                throw new Error('Age connat be negative')
        }
    },
    // tokens is an array of object, each object will have a key named token.
    // token key should be of type string and is requried whenever data is saved.
    tokens: [{
        token: {
            type: String,
            required: true,
        }
    }]
})

/** Middleware is used to run some function either before or after saving data into database. 
 * This middleware is applied on the schema. Both the below middleware tell mongoose that we want to execute some code before every save, so after doing the executing we should tell it that we have completed with my code, by executing next() function.
 * Pre => run before saving data
 * Post => run after saving data
 * 
 * Note: findOneAndUpdate does not execute the middleware, it overpasses it. So, we can either make some changes while saving the document, or we can have a different hook as middleware for findOneAndUpdate
*/

userSchema.methods.generateAuthToken = function async() {
    const user = this; // for more readability

    const token = jwt.sign({ _id: user._id.toString() }, PRIVATE_KEY_JWT, { expiresIn: '10 seconds' });
    console.log(token);

    user.tokens = user.tokens.concat({ token })
    user.save();

    return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        return 'Unable to Login';
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return 'Unable to Login';
    }

    return user;
}

// Creating our own validation function. We have created this middleware function rather than including these codes into routes
// bcoz we need to hash and save password at multiple places.
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        // if the password field is modified, the bcrypt the password otherwise no need.
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();
})

const User = mongoose.model('user', userSchema);

module.exports = User