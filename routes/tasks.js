// routes/tasks.js
const express = require('express');
const fs = require('fs-extra');
const router = express.Router();

const filePath = './tasks.json';

// Helper function to read tasks
const readTasks = async () => {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write tasks
const writeTasks = async (tasks) => {
  await fs.writeFile(filePath, JSON.stringify(tasks, null, 2));
};

// Helper function to get the next task ID
const getNextId = (tasks) => {
  if (tasks.length === 0) return 1; // Start with 1 if no tasks exist
  const maxId = Math.max(...tasks.map((task) => parseInt(task.id, 10)));
  return maxId + 1;
};

// GET /tasks: Retrieve a list of all tasks from a JSON file.
router.get('/', async (req, res) => {
  try {
    const tasks = await readTasks();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Error reading tasks', error: err });
  }
});

//GET /tasks/:id: Retrieve a specific task by ID from the JSON file.
router.get('/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const task = tasks.find((t) => t.id === req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Error reading task', error: err });
  }
});

// POST /tasks: Create a new task and store it in the JSON file.
router.post('/', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const tasks = await readTasks();
    const newTask = {
      id: String(getNextId(tasks)),
      title,
      description,
    };
    tasks.push(newTask);
    await writeTasks(tasks);
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ message: 'Error creating task', error: err });
  }
});

// PUT /tasks/:id: Update a task by ID in the JSON file.
router.put('/:id', async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  try {
    const tasks = await readTasks();
    const taskIndex = tasks.findIndex((t) => t.id === req.params.id);
    if (taskIndex === -1) return res.status(404).json({ message: 'Task not found' });

    tasks[taskIndex] = { ...tasks[taskIndex], title, description };
    await writeTasks(tasks);
    res.json(tasks[taskIndex]);
  } catch (err) {
    res.status(500).json({ message: 'Error updating task', error: err });
  }
});

// DELETE /tasks/:id: Delete a task by ID from the JSON file.
router.delete('/:id', async (req, res) => {
  try {
    const tasks = await readTasks();
    const newTasks = tasks.filter((t) => t.id !== req.params.id);
    if (newTasks.length === tasks.length) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await writeTasks(newTasks);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Error deleting task', error: err });
  }
});

module.exports = router;
