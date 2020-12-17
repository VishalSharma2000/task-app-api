const mongoose = require('mongoose')

const server = "localhost:27017";
const database = "task-app";

mongoose.connect(`mongodb://${server}/${database}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

