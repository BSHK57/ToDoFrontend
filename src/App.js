import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import BackendLoadingScreen from "./BackendLoadingScreen";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [backendReady, setBackendReady] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);

  // Check if backend is ready on app start
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://todobackend-shk.onrender.com/health', {
          method: 'GET',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          setBackendReady(true);
          setIsCheckingBackend(false);
        } else {
          setIsCheckingBackend(false);
        }
      } catch (error) {
        console.log('Initial backend check failed:', error.message);
        setIsCheckingBackend(false);
      }
    };

    checkBackendStatus();
  }, []);

  const fetchTasks = async (token) => {
    try {
      const response = await fetch(
        "https://todobackend-shk.onrender.com/tasks",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      console.log("Fetched tasks:", data);
      // Ensure tasks is always an array
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    }
  };

  useEffect(() => {
    if (token && backendReady) {
      fetchTasks(token);
    }
  }, [token, backendReady]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setTasks([]);
  };

  const addTask = async (text) => {
    try {
      const response = await fetch(
        "https://todobackend-shk.onrender.com/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, status: "pending", priority: "medium" }),
        }
      );
      const newTask = await response.json();
      setTasks([...tasks, newTask]);
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`https://todobackend-shk.onrender.com/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const updateTaskStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "pending" ? "completed" : "pending";
      const response = await fetch(
        `https://todobackend-shk.onrender.com/tasks/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const updateTaskPriority = async (id, newPriority) => {
    try {
      const response = await fetch(
        `https://todobackend-shk.onrender.com/tasks/${id}/priority`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priority: newPriority }),
        }
      );
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
    } catch (error) {
      console.error("Error updating task priority:", error);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority)
  );

  const handleBackendReady = () => {
    setBackendReady(true);
    setIsCheckingBackend(false);
  };

  // Show loading screen if backend is not ready and we're still checking
  if (!backendReady && !isCheckingBackend) {
    return <BackendLoadingScreen onBackendReady={handleBackendReady} />;
  }

  // Show initial loading while checking backend status
  if (isCheckingBackend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🔄</div>
          <p className="text-white text-lg">Checking server status...</p>
        </div>
      </div>
    );
  }

  // Main app UI for authenticated users
  const MainApp = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col">
      <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-lg bg-opacity-90 text-white px-6 py-4 flex justify-between items-center shadow-2xl border-b border-purple-500/20">
        <ul className="flex space-x-4">
          <li>
            <a
              href="#"
              className="px-6 py-2 rounded-full font-semibold transition-all duration-300 hover:bg-white/20 hover:text-white focus:bg-white/30 focus:outline-none bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20 hover:scale-105"
            >
              🏠 Home
            </a>
          </li>
        </ul>
        <button
          onClick={logout}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-red-400/30"
        >
          🚪 Logout
        </button>
      </nav>
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-2xl">
            ✨ MERN To-Do App
          </h1>
          <p className="text-slate-300 text-lg font-medium">Organize your life with style</p>
        </div>
        
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTask(e.target[0].value);
              e.target[0].value = "";
            }}
            className="mb-8 flex gap-4 justify-center"
          >
            <input
              type="text"
              className="p-4 border-2 border-purple-300/30 rounded-2xl w-2/3 bg-white/10 backdrop-blur-sm text-white placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-400/50 focus:border-purple-400 transition-all duration-300 shadow-lg"
              placeholder="✍️ Add a new task..."
            />
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl border border-purple-400/30"
            >
              ➕ Add Task
            </button>
          </form>
          
          <div className="flex gap-6 justify-center flex-wrap">
            <div className="flex flex-col items-center gap-2">
              <label className="text-slate-300 font-semibold text-sm">📊 Filter by Status</label>
              <select
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-3 border-2 border-purple-300/30 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all duration-300 shadow-lg"
                value={filterStatus}
              >
                <option value="all" className="bg-slate-800 text-white">All Status</option>
                <option value="pending" className="bg-slate-800 text-white">Pending</option>
                <option value="completed" className="bg-slate-800 text-white">Completed</option>
              </select>
            </div>
            <div className="flex flex-col items-center gap-2">
              <label className="text-slate-300 font-semibold text-sm">🎯 Filter by Priority</label>
              <select
                onChange={(e) => setFilterPriority(e.target.value)}
                className="p-3 border-2 border-purple-300/30 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all duration-300 shadow-lg"
                value={filterPriority}
              >
                <option value="all" className="bg-slate-800 text-white">All Priorities</option>
                <option value="low" className="bg-slate-800 text-white">Low</option>
                <option value="medium" className="bg-slate-800 text-white">Medium</option>
                <option value="high" className="bg-slate-800 text-white">High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-slate-400 text-xl font-medium">No tasks yet. Add one above!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="backdrop-blur-xl bg-white/10 rounded-2xl shadow-2xl border border-white/20 hover:border-purple-400/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/20 hover:shadow-2xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {task.status === "completed" ? "✅" : "⏳"}
                      </span>
                      <span className={`text-lg font-medium ${task.status === "completed" ? "text-green-300 line-through" : "text-white"}`}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex gap-3 items-center text-sm">
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        task.status === "pending" 
                          ? "bg-yellow-500/20 text-yellow-300 border border-yellow-400/30" 
                          : "bg-green-500/20 text-green-300 border border-green-400/30"
                      }`}>
                        {task.status === "pending" ? "🔄 Pending" : "✨ Completed"}
                      </span>
                      <span className={`px-3 py-1 rounded-full font-semibold ${
                        task.priority === "high" 
                          ? "bg-red-500/20 text-red-300 border border-red-400/30" 
                          : task.priority === "medium"
                          ? "bg-orange-500/20 text-orange-300 border border-orange-400/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                      }`}>
                        {task.priority === "high" ? "🔥 High" : task.priority === "medium" ? "⚡ Medium" : "❄️ Low"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap">
                    <button
                      onClick={() => updateTaskStatus(task._id, task.status)}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg ${
                        task.status === "pending"
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border border-yellow-400/30"
                          : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border border-green-400/30"
                      }`}
                    >
                      {task.status === "pending" ? "✅ Complete" : "🔄 Pending"}
                    </button>
                    <select
                      value={task.priority}
                      onChange={(e) => updateTaskPriority(task._id, e.target.value)}
                      className="p-2 border-2 border-purple-300/30 rounded-xl bg-white/10 backdrop-blur-sm text-white focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all duration-300 shadow-lg"
                    >
                      <option value="low" className="bg-slate-800 text-white">❄️ Low</option>
                      <option value="medium" className="bg-slate-800 text-white">⚡ Medium</option>
                      <option value="high" className="bg-slate-800 text-white">🔥 High</option>
                    </select>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-xl border border-red-400/30"
                      title="Delete Task"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <footer className="bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur-lg bg-opacity-90 text-white p-6 mt-auto text-center shadow-2xl border-t border-purple-500/20">
        <p className="text-lg font-medium">© 2025 Your Amazing To-Do App ✨</p>
        <p className="text-purple-200 text-sm mt-1">Made with 💜 and modern design</p>
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={token ? <MainApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;