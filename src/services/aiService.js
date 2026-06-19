const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

const analyzeTask = async (taskTitle, taskDescription) => {
  try {
    console.log("🤖 Calling OpenRouter AI...");

    const completion = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        {
          role: "system",
          content: `
You are a smart task management assistant.

Respond ONLY with valid JSON.

Format:
{
  "priority":"HIGH|MEDIUM|LOW",
  "estimatedDays":number,
  "suggestedDeadline":"YYYY-MM-DD",
  "reasoning":"string",
  "subtasks":["task1","task2","task3"]
}
`
        },
        {
          role: "user",
          content: `
Task Title: ${taskTitle}

Task Description:
${taskDescription || "No description"}
`
        }
      ]
    });

    const text =
      completion.choices[0].message.content;

    console.log("AI Response:", text);

    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleanedText);

  } catch (error) {
    console.error("OpenRouter Error:", error);

    return {
      priority: "MEDIUM",
      estimatedDays: 3,
      suggestedDeadline: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split("T")[0],
      reasoning: "Fallback response",
      subtasks: [
        "Plan the task",
        "Execute the task",
        "Review and complete"
      ]
    };
  }
};

module.exports = { analyzeTask };