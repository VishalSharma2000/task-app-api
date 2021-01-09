/**
 * For authorizing a user we are using jsonwebtoken
 * Main idea: 
 * 1) While sign up or login we are creating a token for that user at that event and send along the response.
 * 2) In future, when that user try to access the authorized routes (like /task here) then front client side the authorized token should 
 * be sent through in the header.
 * 3) In the middleware we check if the token provided is correct or not. If the token provided is correct then we let the user to access the 
 * authorized routes otherwise redirect the user to login page.
 * This is basically called session-based authentication
 * 
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const {PRIVATE_KEY_JWT} = process.env;

const auth = async (req, res, next) => {
  try {
    // header => Bearer token
    console.log(req.headers);
    const token = req.headers['authorization'].split(' ')[1]; // if header is not provided then for catching the error catch block will be ran
    console.log(token);
    const decoded = jwt.verify(token, PRIVATE_KEY_JWT);

    // check for the user with id, and token
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

    // if user given provided token does not exist in the database then throw unauthorized access.
    if (!user) throw new Error();

    // we are storing the user object fetched from database into the request object, so that the following route don't have to 
    // again fetch data of the user from db.
    req.user = user;
    req.token = token;

    next();
  } catch (e) {
    console.log(e);
    res.status(401).send({ error: 'Please Authenticate' });
  }
};

module.exports = auth;