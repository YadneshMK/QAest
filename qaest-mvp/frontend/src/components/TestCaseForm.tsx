import React, { useState } from 'react';

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCaseFormData {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'draft' | 'active' | 'deprecated' | 'archived' | 'passed' | 'failed' | 'blocked' | 'not_executed';
  category: string;
  module: string;
  appType: 'web' | 'mobile' | 'desktop' | 'api';
  osType: 'windows' | 'macos' | 'linux' | 'ios' | 'android' | 'cross_platform';
  prerequisites: string;
  testSteps: TestStep[];
  expectedResults: string;
  testDataRequirements: string;
  environmentRequirements: string;
  estimatedTime: number;
  tags: string[];
  epicId: string;
  prdLink: string;
  relatedRequirements: string;
}

interface TestCaseFormProps {
  onSubmit: (data: TestCaseFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TestCaseFormData>;
}

const TestCaseForm: React.FC<TestCaseFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState<TestCaseFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    priority: initialData?.priority || 'medium',
    status: initialData?.status || 'draft',
    category: initialData?.category || '',
    module: initialData?.module || '',
    appType: initialData?.appType || 'web',
    osType: initialData?.osType || 'cross_platform',
    prerequisites: initialData?.prerequisites || '',
    testSteps: initialData?.testSteps || [{ stepNumber: 1, action: '', expectedResult: '' }],
    expectedResults: initialData?.expectedResults || '',
    testDataRequirements: initialData?.testDataRequirements || '',
    environmentRequirements: initialData?.environmentRequirements || '',
    estimatedTime: initialData?.estimatedTime || 5,
    tags: initialData?.tags || [],
    epicId: initialData?.epicId || '',
    prdLink: initialData?.prdLink || '',
    relatedRequirements: initialData?.relatedRequirements || ''
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'steps' | 'metadata'>('basic');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    if (!formData.module.trim()) {
      newErrors.module = 'Module is required';
    }
    if (formData.testSteps.some(step => !step.action.trim() || !step.expectedResult.trim())) {
      newErrors.testSteps = 'All test steps must have action and expected result';
    }
    if (formData.estimatedTime < 1) {
      newErrors.estimatedTime = 'Estimated time must be at least 1 minute';
    }
    
    // Validate URL if provided
    if (formData.prdLink.trim()) {
      try {
        new URL(formData.prdLink);
      } catch {
        newErrors.prdLink = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleAddStep = () => {
    setFormData({
      ...formData,
      testSteps: [...formData.testSteps, { 
        stepNumber: formData.testSteps.length + 1, 
        action: '', 
        expectedResult: '' 
      }]
    });
  };

  const handleRemoveStep = (index: number) => {
    const newSteps = formData.testSteps.filter((_, i) => i !== index);
    // Renumber steps
    const renumberedSteps = newSteps.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    setFormData({ ...formData, testSteps: renumberedSteps });
  };

  const handleStepChange = (index: number, field: 'action' | 'expectedResult', value: string) => {
    const newSteps = [...formData.testSteps];
    newSteps[index][field] = value;
    setFormData({ ...formData, testSteps: newSteps });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const tabStyle = {
    padding: '10px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease'
  };

  const activeTabStyle = {
    ...tabStyle,
    color: '#ff6b35',
    borderBottomColor: '#ff6b35'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    transition: 'border-color 0.3s ease',
    boxSizing: 'border-box' as const
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333',
    fontSize: '14px'
  };

  const errorStyle = {
    color: '#dc3545',
    fontSize: '12px',
    marginTop: '5px'
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <button
            type="button"
            style={activeTab === 'basic' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('basic')}
          >
            Basic Information
          </button>
          <button
            type="button"
            style={activeTab === 'details' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('details')}
          >
            Test Details
          </button>
          <button
            type="button"
            style={activeTab === 'steps' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('steps')}
          >
            Test Steps
          </button>
          <button
            type="button"
            style={activeTab === 'metadata' ? activeTabStyle : tabStyle}
            onClick={() => setActiveTab('metadata')}
          >
            Metadata & Links
          </button>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                  Title <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{
                    ...inputStyle,
                    borderColor: errors.title ? '#dc3545' : '#ddd'
                  }}
                  placeholder="Enter test case title"
                />
                {errors.title && <div style={errorStyle}>{errors.title}</div>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                  Description <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '100px',
                    resize: 'vertical',
                    borderColor: errors.description ? '#dc3545' : '#ddd'
                  }}
                  placeholder="Describe what this test case validates"
                />
                {errors.description && <div style={errorStyle}>{errors.description}</div>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    style={inputStyle}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={inputStyle}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="archived">Archived</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="blocked">Blocked</option>
                    <option value="not_executed">Not Executed</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Category <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      ...inputStyle,
                      borderColor: errors.category ? '#dc3545' : '#ddd'
                    }}
                    placeholder="e.g., Authentication, Payment"
                  />
                  {errors.category && <div style={errorStyle}>{errors.category}</div>}
                </div>

                <div>
                  <label style={labelStyle}>
                    Module <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.module}
                    onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                    style={{
                      ...inputStyle,
                      borderColor: errors.module ? '#dc3545' : '#ddd'
                    }}
                    placeholder="e.g., User Management"
                  />
                  {errors.module && <div style={errorStyle}>{errors.module}</div>}
                </div>

                <div>
                  <label style={labelStyle}>App Type</label>
                  <select
                    value={formData.appType}
                    onChange={(e) => setFormData({ ...formData, appType: e.target.value as any })}
                    style={inputStyle}
                  >
                    <option value="web">Web</option>
                    <option value="mobile">Mobile</option>
                    <option value="desktop">Desktop</option>
                    <option value="api">API</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>OS Type</label>
                  <select
                    value={formData.osType}
                    onChange={(e) => setFormData({ ...formData, osType: e.target.value as any })}
                    style={inputStyle}
                  >
                    <option value="cross_platform">Cross-platform</option>
                    <option value="windows">Windows</option>
                    <option value="macos">macOS</option>
                    <option value="linux">Linux</option>
                    <option value="ios">iOS</option>
                    <option value="android">Android</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Test Details Tab */}
          {activeTab === 'details' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Prerequisites</label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="List any prerequisites or setup required before running this test"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Expected Results</label>
                <textarea
                  value={formData.expectedResults}
                  onChange={(e) => setFormData({ ...formData, expectedResults: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Describe the expected outcome of this test"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Test Data Requirements</label>
                <textarea
                  value={formData.testDataRequirements}
                  onChange={(e) => setFormData({ ...formData, testDataRequirements: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Specify any test data needed (e.g., user accounts, sample data)"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Environment Requirements</label>
                <textarea
                  value={formData.environmentRequirements}
                  onChange={(e) => setFormData({ ...formData, environmentRequirements: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Specify environment requirements (e.g., browser versions, server config)"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>
                  Estimated Execution Time (minutes) <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) || 1 })}
                  style={{
                    ...inputStyle,
                    maxWidth: '200px',
                    borderColor: errors.estimatedTime ? '#dc3545' : '#ddd'
                  }}
                />
                {errors.estimatedTime && <div style={errorStyle}>{errors.estimatedTime}</div>}
              </div>
            </div>
          )}

          {/* Test Steps Tab */}
          {activeTab === 'steps' && (
            <div>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#333' }}>Test Steps</h3>
                <button
                  type="button"
                  onClick={handleAddStep}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  + Add Step
                </button>
              </div>
              {errors.testSteps && <div style={errorStyle}>{errors.testSteps}</div>}
              
              {formData.testSteps.map((step, index) => (
                <div key={index} style={{ 
                  marginBottom: '20px', 
                  padding: '20px', 
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#495057' }}>Step {step.stepNumber}</h4>
                    {formData.testSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(index)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ ...labelStyle, fontSize: '13px' }}>Action</label>
                    <input
                      type="text"
                      value={step.action}
                      onChange={(e) => handleStepChange(index, 'action', e.target.value)}
                      style={inputStyle}
                      placeholder="Describe the action to perform"
                    />
                  </div>
                  
                  <div>
                    <label style={{ ...labelStyle, fontSize: '13px' }}>Expected Result</label>
                    <input
                      type="text"
                      value={step.expectedResult}
                      onChange={(e) => handleStepChange(index, 'expectedResult', e.target.value)}
                      style={inputStyle}
                      placeholder="Describe the expected result"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Metadata Tab */}
          {activeTab === 'metadata' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    style={{ ...inputStyle, flex: 1 }}
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Tag
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: '4px 12px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '20px',
                        fontSize: '13px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#6c757d',
                          padding: 0,
                          fontSize: '16px',
                          lineHeight: 1
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Epic/Feature ID</label>
                <input
                  type="text"
                  value={formData.epicId}
                  onChange={(e) => setFormData({ ...formData, epicId: e.target.value })}
                  style={inputStyle}
                  placeholder="e.g., EPIC-123"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>PRD Link</label>
                <input
                  type="url"
                  value={formData.prdLink}
                  onChange={(e) => setFormData({ ...formData, prdLink: e.target.value })}
                  style={{
                    ...inputStyle,
                    borderColor: errors.prdLink ? '#dc3545' : '#ddd'
                  }}
                  placeholder="https://..."
                />
                {errors.prdLink && <div style={errorStyle}>{errors.prdLink}</div>}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Related Requirements</label>
                <textarea
                  value={formData.relatedRequirements}
                  onChange={(e) => setFormData({ ...formData, relatedRequirements: e.target.value })}
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="List related requirements, user stories, or tickets"
                />
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div style={{ 
          padding: '20px 30px', 
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '10px 24px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              backgroundColor: '#ff6b35',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {initialData ? 'Update Test Case' : 'Create Test Case'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TestCaseForm;