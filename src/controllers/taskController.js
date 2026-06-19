const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ─── CREATE TASK ───────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, estimatedDays } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!title) {
      return res.status(400).json({ 
        message: 'Task title is required' 
      });
    }

    // Create task in database
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        estimatedDays: estimatedDays || null,
        status: 'TODO',
        userId
      }
    });

    res.status(201).json({
      message: '✅ Task created successfully!',
      task
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ─── GET ALL TASKS ─────────────────────────────────────────
const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.userId;

    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      message: '✅ Tasks fetched successfully!',
      count: tasks.length,
      tasks
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ─── GET SINGLE TASK ───────────────────────────────────────
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const task = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      },
      include: { subtasks: true }
    });

    if (!task) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    res.status(200).json({
      message: '✅ Task fetched successfully!',
      task
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ─── UPDATE TASK ───────────────────────────────────────────
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, description, priority, deadline, estimatedDays, status } = req.body;

    // Check task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      }
    });

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title: title || existingTask.title,
        description: description || existingTask.description,
        priority: priority || existingTask.priority,
        deadline: deadline ? new Date(deadline) : existingTask.deadline,
        estimatedDays: estimatedDays || existingTask.estimatedDays,
        status: status || existingTask.status
      },
      include: { subtasks: true }
    });

    res.status(200).json({
      message: '✅ Task updated successfully!',
      task: updatedTask
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ─── DELETE TASK ───────────────────────────────────────────
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: { 
        id: parseInt(id),
        userId 
      }
    });

    if (!existingTask) {
      return res.status(404).json({ 
        message: 'Task not found' 
      });
    }

    // Delete task (subtasks auto-deleted due to cascade)
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      message: '✅ Task deleted successfully!'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = { 
  createTask, 
  getAllTasks, 
  getTaskById, 
  updateTask, 
  deleteTask 
};