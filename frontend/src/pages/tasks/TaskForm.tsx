import React, { useState, useEffect } from 'react';
import { Task } from '../../types';

interface TaskFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    workOrderId: '',
    productId: '',
    stageId: '',
    name: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    targetQuantity: 1,
    dueDate: '',
    estimatedDuration: 60
  });

  const [workOrders, setWorkOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkOrders();
    fetchProducts();
    fetchEmployees();
  }, []);

  const fetchWorkOrders = async () => {
    try {
      const response = await fetch('/api/v1/production/work-orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkOrders(data.data.workOrders || []);
      }
    } catch (error) {
      console.error('Error fetching work orders:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/v1/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/users?role=employee', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchStages = async (productId: string) => {
    if (!productId) return;
    
    try {
      const response = await fetch(`/api/v1/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStages(data.data.product.processStages || []);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If product changes, fetch its stages
    if (name === 'productId') {
      fetchStages(value);
      setFormData(prev => ({ ...prev, stageId: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Set due date to end of day if not specified
    const submitData = {
      ...formData,
      dueDate: formData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    onSubmit(submitData);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Assign New Task</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Work Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Order *
          </label>
          <select
            name="workOrderId"
            value={formData.workOrderId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Work Order</option>
            {workOrders.map((order: any) => (
              <option key={order._id} value={order._id}>
                {order.orderNumber} - {order.productName}
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product *
          </label>
          <select
            name="productId"
            value={formData.productId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Product</option>
            {products.map((product: any) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.sku})
              </option>
            ))}
          </select>
        </div>

        {/* Stage Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Process Stage *
          </label>
          <select
            name="stageId"
            value={formData.stageId}
            onChange={handleInputChange}
            required
            disabled={!formData.productId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Stage</option>
            {stages.map((stage: any) => (
              <option key={stage.stageId} value={stage.stageId}>
                {stage.order}. {stage.name}
              </option>
            ))}
          </select>
        </div>

        {/* Task Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assigned To *
            </label>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Employee</option>
              {employees.map((employee: any) => (
                <option key={employee._id} value={employee._id}>
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Quantity *
            </label>
            <input
              type="number"
              name="targetQuantity"
              value={formData.targetQuantity}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes) *
            </label>
            <input
              type="number"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
