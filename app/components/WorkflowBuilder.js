'use client'

import React, { useState } from 'react';
import { Plus, Sparkles, User } from 'lucide-react';

const WorkflowBuilder = () => {
  const [workflowTitle, setWorkflowTitle] = useState('After discovery calls');
  const [steps, setSteps] = useState([
    {
      id: 1,
      instruction: 'At 8pm, pull all the Gong recordings from the rep\'s discovery calls that day. Filter to only deals which have a next step set in Salesforce',
      executor: 'ai'
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const addStep = () => {
    const newStep = {
      id: Date.now(),
      instruction: '',
      executor: 'ai'
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (id, field, value) => {
    setSteps(steps.map(step => 
      step.id === id ? { ...step, [field]: value } : step
    ));
  };

  const deleteStep = (id) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== id));
    }
  };

  const saveWorkflow = async () => {
    // Basic validation
    if (!workflowTitle.trim()) {
      alert('Please enter a workflow title');
      return;
    }

    const hasEmptySteps = steps.some(step => !step.instruction.trim());
    if (hasEmptySteps) {
      alert('Please fill in all step instructions');
      return;
    }

    setIsSaving(true);
    
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: workflowTitle,
          steps: steps
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Workflow saved successfully!');
      } else {
        alert('Error saving workflow: ' + result.error);
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving workflow: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Workflow Title */}
        <div className="mb-8">
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            className="text-3xl font-bold text-gray-900 bg-transparent border-none outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded transition-all cursor-text hover:bg-gray-100"
          />
        </div>

        {/* Workflow Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* Step Box */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {/* Instruction Input */}
                <textarea
                  value={step.instruction}
                  onChange={(e) => updateStep(step.id, 'instruction', e.target.value)}
                  placeholder="Enter instructions in natural language..."
                  className="w-full min-h-24 text-gray-700 bg-transparent border-none outline-none resize-none placeholder-gray-400"
                />

                {/* Executor Selector */}
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => updateStep(step.id, 'executor', 'ai')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      step.executor === 'ai'
                        ? 'bg-orange-100 text-orange-800 border border-orange-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI agent</span>
                  </button>
                  
                  <button
                    onClick={() => updateStep(step.id, 'executor', 'human')}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      step.executor === 'human'
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Human</span>
                  </button>
                </div>

                {/* Delete Step Button (only show if more than 1 step) */}
                {steps.length > 1 && (
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => deleteStep(step.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete Step
                    </button>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-4">
                  <div className="w-px h-8 bg-red-300"></div>
                </div>
              )}
            </div>
          ))}

          {/* Add Step Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={addStep}
              className="flex items-center justify-center w-10 h-10 bg-white border-2 border-red-300 rounded-full hover:bg-red-50 hover:border-red-400 transition-colors group"
            >
              <Plus className="w-5 h-5 text-red-500 group-hover:text-red-600" />
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-12 flex justify-center">
          <button 
            onClick={saveWorkflow}
            disabled={isSaving}
            className={`px-6 py-2 rounded-md transition-colors font-medium ${
              isSaving 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Workflow'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
