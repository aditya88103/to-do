const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'tasks.json');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Load tasks from file
function loadTasks() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading file:', err);
  }
  return [];
}

// Save tasks to file
function saveTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

// GET / - Render all tasks
app.get('/', (req, res) => {
  const tasks = loadTasks();
  res.render('index', { tasks });
});

// POST /add - Add task to array and file
app.post('/add', (req, res) => {
  const { title } = req.body;
  
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const tasks = loadTasks();
  const newTask = {
    id: Date.now(),
    title: title,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  saveTasks(tasks);
  
  res.json({ success: true, task: newTask });
});

// PUT /update - Update task by index
app.put('/update/:idx', (req, res) => {
  const { idx } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const tasks = loadTasks();
  const index = parseInt(idx);

  if (index < 0 || index >= tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[index].title = title;
  tasks[index].updatedAt = new Date().toISOString();
  saveTasks(tasks);

  res.json({ success: true, task: tasks[index] });
});

// DELETE /delete - Delete task by index
app.delete('/delete/:idx', (req, res) => {
  const { idx } = req.params;
  const tasks = loadTasks();
  const index = parseInt(idx);

  if (index < 0 || index >= tasks.length) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const deletedTask = tasks.splice(index, 1)[0];
  saveTasks(tasks);

  res.json({ success: true, deletedTask });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

