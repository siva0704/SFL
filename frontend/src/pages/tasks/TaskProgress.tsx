import React, { useState } from 'react';
import { Task } from '../../types';

interface TaskProgressProps {
  task: Task;
  onUpdateProgress: (taskId: string, progressData: any) => void;
  onCompleteQualityCheck: (taskId: string, checkData: any) => void;
  onUpdateTask: (taskId: string, taskData: any) => void;
  onClose: () => void;
  canEdit: boolean;
}

const TaskProgress: React.FC<TaskProgressProps> = ({
  task,
  onUpdateProgress,
  onCompleteQualityCheck,
  onUpdateTask,
  onClose,
  canEdit
}) => {
  const [progressForm, setProgressForm] = useState({
    completedQuantity: task.completedQuantity,
    notes: task.notes || ''
  });

  const [qualityCheckForm, setQualityCheckForm] = useState({
    checkName: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    name: task.name,
    description: task.description || '',
    priority: task.priority,
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    assignedTo: task.assignedTo
  });

  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'quality'>('details');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = () => {
    return task.targetQuantity > 0 ? (task.completedQuantity / task.targetQuantity) * 100 : 0;
  };

  const isOverdue = () => {
    return new Date(task.dueDate) < new Date() && task.status !== 'completed';
  };

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProgress(task._id, progressForm);
  };

  const handleQualityCheckSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qualityCheckForm.checkName) {
      onCompleteQualityCheck(task._id, qualityCheckForm);
      setQualityCheckForm({ checkName: '', notes: '' });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateTask(task._id, editForm);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProgressForm(prev => ({ ...prev, [name]: value }));
  };

  const handleQualityCheckChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQualityCheckForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{task.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{task.taskNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'progress'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Progress
          </button>
          <button
            onClick={() => setActiveTab('quality')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'quality'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Quality Checks
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Task Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Task Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priority</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Assigned To</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {typeof task.assignedTo === 'object' && task.assignedTo 
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : 'Unassigned'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Due Date</dt>
                    <dd className={`mt-1 text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue() && <span className="ml-2 text-red-500">(Overdue)</span>}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Progress</span>
                      <span className="text-gray-900">{getProgressPercentage().toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Target Quantity</dt>
                      <dd className="mt-1 text-sm text-gray-900">{task.targetQuantity}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Completed</dt>
                      <dd className="mt-1 text-sm text-gray-900">{task.completedQuantity}</dd>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {task.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>
            )}

            {/* Edit Form (for supervisors/admins) */}
            {canEdit && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Task Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        name="priority"
                        value={editForm.priority}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        value={editForm.dueDate}
                        onChange={handleEditChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Update Progress</h3>
            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed Quantity (max: {task.targetQuantity})
                </label>
                <input
                  type="number"
                  name="completedQuantity"
                  value={progressForm.completedQuantity}
                  onChange={handleInputChange}
                  min="0"
                  max={task.targetQuantity}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={progressForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any notes about the progress..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Progress
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Quality Checks</h3>
            
            {/* Existing Quality Checks */}
            {task.qualityChecks && task.qualityChecks.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-900">Quality Checks</h4>
                {task.qualityChecks.map((check, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{check.name}</h5>
                        {check.description && (
                          <p className="text-sm text-gray-500 mt-1">{check.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          check.completed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {check.completed ? 'Completed' : 'Pending'}
                        </span>
                        {check.required && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                    {check.completed && (
                      <div className="mt-2 text-sm text-gray-500">
                        <p>Completed by: {check.completedBy}</p>
                        <p>Completed at: {check.completedAt ? new Date(check.completedAt).toLocaleString() : 'N/A'}</p>
                        {check.notes && <p>Notes: {check.notes}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Complete Quality Check Form */}
            <div className="border-t pt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Complete Quality Check</h4>
              <form onSubmit={handleQualityCheckSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Check Name</label>
                  <select
                    name="checkName"
                    value={qualityCheckForm.checkName}
                    onChange={handleQualityCheckChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a quality check</option>
                    {task.qualityChecks?.map((check, index) => (
                      !check.completed && (
                        <option key={index} value={check.name}>
                          {check.name} {check.required && '(Required)'}
                        </option>
                      )
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={qualityCheckForm.notes}
                    onChange={handleQualityCheckChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add notes about the quality check..."
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!qualityCheckForm.checkName}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Complete Check
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskProgress;
