const { PrismaClient } = require('@prisma/client');
const { analyzeTask } = require('../services/aiService');

const prisma = new PrismaClient();

// ─── ANALYZE TASK WITH AI ──────────────────────────────────
const analyzeTaskWithAI = async (req, res) => {
  try {
        console.log("Request Body:", req.body);
        const { title, description } = req.body;
        const userId = req.user.userId;
    // Validate input
    if (!title) {
      return res.status(400).json({ 
        message: 'Task title is required' 
      });
    }

    console.log('🤖 Analyzing task with AI:', title);

    // Call AI service
    const aiResult = await analyzeTask(title, description);

    console.log('✅ AI Analysis complete:', aiResult);

    // Save task to database with AI suggestions
    const task = await prisma.task.create({
      data: {
        title,
        description: description || null,
        priority: aiResult.priority,
        deadline: aiResult.suggestedDeadline 
          ? new Date(aiResult.suggestedDeadline) 
          : null,
        estimatedDays: aiResult.estimatedDays,
        status: 'TODO',
        userId,
        // Create subtasks automatically
        subtasks: {
          create: aiResult.subtasks.map(subtaskTitle => ({
            title: subtaskTitle,
            completed: false
          }))
        }
      },
      include: { subtasks: true }
    });

    res.status(201).json({
      message: '✅ Task analyzed and created with AI!',
      aiAnalysis: {
        priority: aiResult.priority,
        estimatedDays: aiResult.estimatedDays,
        suggestedDeadline: aiResult.suggestedDeadline,
        reasoning: aiResult.reasoning
      },
      task
    });

  } catch (error) {
  console.error("AI Controller Error:", error);

  res.status(500).json({
    message: error.message,
    error: error
  });
}
};

module.exports = { analyzeTaskWithAI };