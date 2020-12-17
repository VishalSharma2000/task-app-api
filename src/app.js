const express = require('express');
require('./db/mongooseConnection');
const userRoute = require('./routes/users')
const taskRoute = require('./routes/tasks')

const app = express();

const PORT = process.env.PORT || 3000

app.use(express.json());
app.use('/users' ,userRoute)                  // Register user route to express app
app.use('/tasks' ,taskRoute)                  // Register task route to express app

app.listen(PORT, () => {
    console.log('Server is running at port ' + PORT);
})