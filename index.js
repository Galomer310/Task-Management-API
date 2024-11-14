const express = require('express');
const bodyParser = require('body-parser');
const taskRouter = require('./routes/tasks.js');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/task', taskRouter);



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost${PORT}`);
});