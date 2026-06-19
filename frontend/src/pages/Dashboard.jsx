import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { FaEdit } from "react-icons/fa";
import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaTrash,
  FaPlus
} from "react-icons/fa";
function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const fetchTasks = async () => {
    try {
      const response = await API.get("/tasks");
      setTasks(response.data.tasks);
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!title.trim()) {
      alert("Please enter a task title!");
      return;
    }

    try {
      setCreating(true);

      await API.post("/ai/analyze", {
        title,
        description,
      });

      setTitle("");
      setDescription("");
      setShowForm(false);

      fetchTasks();
    } catch (error) {
      console.error("Create Task Error:", error);
      alert("Failed to create task!");
    } finally {
      setCreating(false);
    }
  };

  const deleteTask = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/tasks/${id}`);

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Delete Task Error:", error);
      alert("Failed to delete task!");
    }
  };
  const editTask = async () => {
  try {
    await API.put(`/tasks/${editingTask.id}`, {
      title: editTitle,
      description: editDescription,
    });

    setEditingTask(null);
    fetchTasks();
  } catch (error) {
    console.error(error);
    alert("Failed to update task");
  }
};

  const updateStatus = async (id, status) => {
  try {
    await API.put(`/tasks/${id}`, {
      status,
    });

    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, status }
          : task
      )
    );
  } catch (error) {
    console.error(error);
    alert("Failed to update status");
  }
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      await fetchTasks();
    };

    initialize();
  }, [navigate]);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
  (task) => task.status === "COMPLETED"
).length;

const inProgressTasks = tasks.filter(
  (task) => task.status === "IN_PROGRESS"
).length;

const pendingTasks = tasks.filter(
  (task) => task.status === "TODO"
).length;
const completionPercentage =
  totalTasks === 0
    ? 0
    : Math.round(
        (completedTasks / totalTasks) * 100
      );
const filteredTasks = tasks.filter((task) => {
  const matchesSearch =
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.description || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  const matchesPriority =
    priorityFilter === "ALL"
      ? true
      : task.priority === priorityFilter;

  return matchesSearch && matchesPriority;
});
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">     
     <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-5 flex justify-between items-center shadow-lg">
  <div>
    <h1 className="text-3xl font-bold">
      🤖 AI Task Manager
    </h1>

    <p className="text-blue-100 text-sm">
      Smart Productivity Assistant
    </p>
  </div>

  <button
    onClick={handleLogout}
    className="bg-white text-blue-700 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100"
  >
    Logout
  </button>
</nav>
      <div className="p-6">
<div className="grid md:grid-cols-4 gap-4 mb-8">
  <div className="bg-white rounded-xl shadow p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500">Total Tasks</p>
<h2 className="text-3xl font-bold">
  {totalTasks}
</h2>     </div>
      <FaTasks size={30} />
    </div>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500">Completed</p>
        <h2 className="text-3xl font-bold text-green-600">
          {completedTasks}
        </h2>
      </div>
      <FaCheckCircle size={30} />
    </div>
  </div>

  <div className="bg-white rounded-xl shadow p-5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500">Pending</p>
        <h2 className="text-3xl font-bold text-orange-500">
          {pendingTasks}
        </h2>
      </div>
      <FaClock size={30} />
    </div>
  </div>

</div>
<div className="bg-white rounded-xl shadow p-5">
  <p className="text-gray-500 mb-2">
    Progress
  </p>

  <div className="w-full bg-gray-200 rounded-full h-4">
    <div
      className="bg-green-500 h-4 rounded-full transition-all duration-500"
      style={{
        width: `${completionPercentage}%`,
      }}
    ></div>
  </div>

  <p className="mt-2 font-bold text-green-600">
    {completionPercentage}% Complete
  </p>
</div>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

  <h2 className="text-3xl font-bold">
    My Tasks
  </h2>

  <input
    type="text"
    placeholder="🔍 Search tasks..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="border p-2 rounded-lg w-full md:w-72"
  />
  <select
  value={priorityFilter}
  onChange={(e) => setPriorityFilter(e.target.value)}
  className="border p-2 rounded-lg"
>
  <option value="ALL">All Priorities</option>
  <option value="HIGH">High Priority</option>
  <option value="MEDIUM">Medium Priority</option>
  <option value="LOW">Low Priority</option>
</select>

  <button
    onClick={() => setShowForm(!showForm)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
  >
    {showForm ? (
      "Cancel"
    ) : (
      <>
        <FaPlus />
        Add Task
      </>
    )}
  </button>

</div>

        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-bold mb-4">
              Create New Task
            </h3>

            <input
              type="text"
              placeholder="Task title (e.g. Learn Docker)"
              className="w-full border p-2 rounded mb-3"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Description (optional)"
              className="w-full border p-2 rounded mb-3"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={createTask}
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold w-full"
            >
              {creating
                ? "🤖 AI is analyzing..."
                : "Create Task with AI"}
            </button>
          </div>
        )}

        {loading && (
          <p className="text-gray-500">Loading tasks...</p>
        )}

        {!loading && tasks.length === 0 && (
          <p className="text-gray-500">
            No tasks yet. Create your first task!
          </p>
        )}
        {editingTask && (
  <div className="bg-white p-6 rounded-lg shadow mb-6 border">
    <h3 className="text-xl font-bold mb-4">
      Edit Task
    </h3>

    <input
      type="text"
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      className="w-full border p-2 rounded mb-3"
    />

    <textarea
      rows={3}
      value={editDescription}
      onChange={(e) => setEditDescription(e.target.value)}
      className="w-full border p-2 rounded mb-3"
    />

    <div className="flex gap-3">
      <button
        onClick={editTask}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Save
      </button>

      <button
        onClick={() => setEditingTask(null)}
        className="bg-gray-500 text-white px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  </div>
)}
        {filteredTasks.length === 0 && !loading && (
  <div className="bg-white p-6 rounded-lg shadow text-center">
    No matching tasks found.
  </div>
)}
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {task.title}
                </h3>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-bold ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-600"
                        : task.priority === "MEDIUM"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {task.priority}
                  </span>
                  <button
  onClick={() => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
  }}
  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded"
>
  <FaEdit />
</button>
                  <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"><FaTrash /></button>
                </div>
              </div>

              <div className="flex gap-2 mt-2">

  {task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "COMPLETED" && (
      <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
        OVERDUE
      </span>
    )}

  {task.deadline &&
    new Date(task.deadline).toDateString() ===
      new Date().toDateString() && (
      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">
        DUE TODAY
      </span>
    )}

</div>

{task.description && (
  <p className="text-gray-500 mt-2">
    {task.description}
  </p>
)}

              <div className="flex gap-4 mt-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
  <span
    className={`px-3 py-1 rounded-full text-xs font-bold ${
      task.status === "COMPLETED"
        ? "bg-green-100 text-green-700"
        : task.status === "IN_PROGRESS"
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700"
    }`}
  >
    {task.status}
  </span>

  <select
    value={task.status}
    onChange={(e) => updateStatus(task.id, e.target.value)}
    className="border rounded px-2 py-1"
  >
    <option value="TODO">TODO</option>
    <option value="IN_PROGRESS">IN_PROGRESS</option>
    <option value="COMPLETED">COMPLETED</option>
  </select>
</div>

                {task.deadline && (
                  <span>
                    Deadline:{" "}
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}

                {task.estimatedDays && (
                  <span>
                    Est: {task.estimatedDays} days
                  </span>
                )}
              </div>

              {task.subtasks?.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    Subtasks:
                  </p>

                  <ul className="list-disc list-inside text-sm text-gray-500">
                    {task.subtasks.map((subtask) => (
                      <li key={subtask.id}>
                        {subtask.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;