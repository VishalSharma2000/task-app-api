const express = require('express');
const cors = require('cors');
require('./db/mongooseConnection');

const userRoute = require('./routes/users/index');
const taskRoute = require('./routes/tasks/index');

const app = express();

const PORT = process.env.PORT || 8000

app.use(express.json());
app.use(cors());
app.use('/users', userRoute);                  // Register user route to express app
app.use('/tasks', taskRoute)                  // Register task route to express app

app.listen(PORT, () => {
    console.log('Server is running at port ' + PORT);
})