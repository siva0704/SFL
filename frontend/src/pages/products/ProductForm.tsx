import React, { useState, useEffect } from 'react';
import { Product } from '../../types';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    status: 'active',
    specifications: {},
    processStages: []
  });

  const [stages, setStages] = useState([
    {
      name: '',
      description: '',
      order: 1,
      estimatedDuration: 60,
      requiredSkills: [],
      qualityChecks: []
    }
  ]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku,
        category: product.category,
        status: product.status,
        specifications: product.specifications || {},
        processStages: product.processStages || []
      });
      
      if (product.processStages) {
        setStages(product.processStages.map(stage => ({
          name: stage.name,
          description: stage.description || '',
          order: stage.order,
          estimatedDuration: stage.estimatedDuration,
          requiredSkills: stage.requiredSkills || [],
          qualityChecks: stage.qualityChecks || []
        })));
      }
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStageChange = (index: number, field: string, value: any) => {
    const updatedStages = [...stages];
    updatedStages[index] = {
      ...updatedStages[index],
      [field]: value
    };
    setStages(updatedStages);
  };

  const addStage = () => {
    setStages([...stages, {
      name: '',
      description: '',
      order: stages.length + 1,
      estimatedDuration: 60,
      requiredSkills: [],
      qualityChecks: []
    }]);
  };

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      const updatedStages = stages.filter((_, i) => i !== index);
      // Reorder stages
      updatedStages.forEach((stage, i) => {
        stage.order = i + 1;
      });
      setStages(updatedStages);
    }
  };

  const addQualityCheck = (stageIndex: number) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].qualityChecks.push({
      name: '',
      description: '',
      required: true
    });
    setStages(updatedStages);
  };

  const removeQualityCheck = (stageIndex: number, checkIndex: number) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].qualityChecks.splice(checkIndex, 1);
    setStages(updatedStages);
  };

  const handleQualityCheckChange = (stageIndex: number, checkIndex: number, field: string, value: any) => {
    const updatedStages = [...stages];
    updatedStages[stageIndex].qualityChecks[checkIndex] = {
      ...updatedStages[stageIndex].qualityChecks[checkIndex],
      [field]: value
    };
    setStages(updatedStages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate stages
    const validStages = stages.filter(stage => stage.name.trim() !== '');
    if (validStages.length === 0) {
      alert('At least one process stage is required');
      return;
    }

    const submitData = {
      ...formData,
      processStages: validStages
    };

    onSubmit(submitData);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">
        {product ? 'Edit Product' : 'Create New Product'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Product Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
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
              SKU *
            </label>
            <input
              type="text"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="discontinued">Discontinued</option>
            </select>
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

        {/* Process Stages */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Process Stages</h3>
            <button
              type="button"
              onClick={addStage}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Stage
            </button>
          </div>

          <div className="space-y-4">
            {stages.map((stage, stageIndex) => (
              <div key={stageIndex} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium">Stage {stage.order}</h4>
                  {stages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStage(stageIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage Name *
                    </label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => handleStageChange(stageIndex, 'name', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      value={stage.estimatedDuration}
                      onChange={(e) => handleStageChange(stageIndex, 'estimatedDuration', parseInt(e.target.value))}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage Description
                  </label>
                  <textarea
                    value={stage.description}
                    onChange={(e) => handleStageChange(stageIndex, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Quality Checks */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Quality Checks
                    </label>
                    <button
                      type="button"
                      onClick={() => addQualityCheck(stageIndex)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Add Check
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stage.qualityChecks.map((check, checkIndex) => (
                      <div key={checkIndex} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Check name"
                          value={check.name}
                          onChange={(e) => handleQualityCheckChange(stageIndex, checkIndex, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={check.description}
                          onChange={(e) => handleQualityCheckChange(stageIndex, checkIndex, 'description', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={check.required}
                            onChange={(e) => handleQualityCheckChange(stageIndex, checkIndex, 'required', e.target.checked)}
                            className="mr-2"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => removeQualityCheck(stageIndex, checkIndex)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
