require('dotenv').config();
const mongoose = require('mongoose')

const {
    MONGODB_URL: server,
    DATABASE: database
} = process.env;

mongoose.connect(`mongodb://${server}/${database}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

