import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Task } from '../../types';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskStats from './TaskStats';
import TaskProgress from './TaskProgress';

const TaskManagement: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [stats, setStats] = useState<any>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/v1/tasks/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const response = await fetch('/api/v1/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks([data.data.task, ...tasks]);
        setShowForm(false);
        fetchStats();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTaskProgress = async (taskId: string, progressData: any) => {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(progressData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data.task : t));
        setSelectedTask(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating task progress:', error);
    }
  };

  const handleCompleteQualityCheck = async (taskId: string, checkData: any) => {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}/quality-check`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(checkData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data.task : t));
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error completing quality check:', error);
    }
  };

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    try {
      const response = await fetch(`/api/v1/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(tasks.map(t => t._id === taskId ? data.data.task : t));
        setSelectedTask(null);
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const canCreateTasks = user?.role === 'admin' || user?.role === 'supervisor';
  const isEmployee = user?.role === 'employee';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEmployee ? 'My Tasks' : 'Task Management'}
        </h1>
        {canCreateTasks && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Assign Task
          </button>
        )}
      </div>

      {stats && <TaskStats stats={stats} />}

      {showForm ? (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      ) : selectedTask ? (
        <TaskProgress
          task={selectedTask}
          onUpdateProgress={handleUpdateTaskProgress}
          onCompleteQualityCheck={handleCompleteQualityCheck}
          onUpdateTask={handleUpdateTask}
          onClose={() => setSelectedTask(null)}
          canEdit={user?.role === 'admin' || user?.role === 'supervisor'}
        />
      ) : (
        <TaskList
          tasks={tasks}
          loading={loading}
          onSelectTask={setSelectedTask}
          userRole={user?.role}
        />
      )}
    </div>
  );
};

export default TaskManagement;
