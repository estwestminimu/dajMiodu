const express = require('express');
const app = express();
const port = 3000

app.use(express.json())


const taskRoutes = require('./routes/tasks')

app.use('/tasks', taskRoutes)


app.listen(port, () => 
    console.log(`server działa na porcie ${port}`)
)