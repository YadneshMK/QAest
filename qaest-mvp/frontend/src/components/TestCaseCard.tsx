import React, { useState } from 'react';

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
}

interface TestCase {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  category: string;
  module: string;
  appType: string;
  osType: string;
  prerequisites?: string;
  testSteps?: TestStep[];
  expectedResults?: string;
  testDataRequirements?: string;
  environmentRequirements?: string;
  estimatedTime?: number;
  tags?: string[];
  epicId?: string;
  prdLink?: string;
  relatedRequirements?: string;
  createdBy: string;
  createdAt: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  version?: number;
}

interface TestCaseCardProps {
  testCase: TestCase;
  currentUser: any;
  onEdit?: (testCase: TestCase) => void;
  onDelete?: (id: string) => void;
  onExecute?: (testCase: TestCase) => void;
}

const TestCaseCard: React.FC<TestCaseCardProps> = ({ 
  testCase, 
  currentUser, 
  onEdit, 
  onDelete,
  onExecute 
}) => {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return '#28a745';
      case 'draft': return '#6c757d';
      case 'passed': return '#20c997';
      case 'failed': return '#dc3545';
      case 'blocked': return '#e83e8c';
      case 'not_executed': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getAppTypeIcon = (appType: string) => {
    switch (appType) {
      case 'web': return '🌐';
      case 'mobile': return '📱';
      case 'desktop': return '🖥️';
      case 'api': return '🔌';
      default: return '📋';
    }
  };

  const canEdit = currentUser && (
    currentUser.username === testCase.createdBy || 
    currentUser.role === 'qa_lead' || 
    currentUser.role === 'senior_qa'
  );

  const canDelete = currentUser && (
    currentUser.username === testCase.createdBy || 
    currentUser.role === 'qa_lead'
  );

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: expanded ? '1px solid #e2e8f0' : 'none'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, color: '#2d3748', fontSize: '1.1rem', fontWeight: '600' }}>
                {testCase.title}
              </h4>
              <span style={{ fontSize: '1.2rem' }}>{getAppTypeIcon(testCase.appType)}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '0.8rem', color: '#718096' }}>
              <span>{testCase.id}</span>
              <span>•</span>
              <span>{testCase.module}</span>
              <span>•</span>
              <span>{testCase.category}</span>
              {testCase.epicId && (
                <>
                  <span>•</span>
                  <span>Epic: {testCase.epicId}</span>
                </>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.2rem',
              color: '#718096',
              padding: '4px',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            ▼
          </button>
        </div>

        <p style={{ margin: '0 0 1rem 0', color: '#718096', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {testCase.description}
        </p>

        {/* Status badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span style={{ 
            backgroundColor: getPriorityColor(testCase.priority), 
            color: 'white',
            padding: '0.25rem 0.75rem', 
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {testCase.priority}
          </span>
          <span style={{ 
            backgroundColor: getStatusColor(testCase.status), 
            color: 'white',
            padding: '0.25rem 0.75rem', 
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {testCase.status}
          </span>
          <span style={{ 
            backgroundColor: '#f1f3f4', 
            color: '#5f6368',
            padding: '0.25rem 0.75rem', 
            borderRadius: '6px',
            fontSize: '0.8rem'
          }}>
            {testCase.osType.replace('_', ' ')}
          </span>
          {testCase.estimatedTime && (
            <span style={{ 
              backgroundColor: '#f8f9fa', 
              color: '#495057',
              padding: '0.25rem 0.75rem', 
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}>
              ⏱️ {testCase.estimatedTime} min
            </span>
          )}
        </div>

        {/* Tags */}
        {testCase.tags && testCase.tags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {testCase.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer info */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#718096'
        }}>
          <span>Created by {testCase.createdBy} • {new Date(testCase.createdAt).toLocaleDateString()}</span>
          {testCase.version && <span>v{testCase.version}</span>}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={{ padding: '1.5rem', backgroundColor: '#f8f9fa' }}>
          {/* Prerequisites */}
          {testCase.prerequisites && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Prerequisites
              </h5>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {testCase.prerequisites}
              </p>
            </div>
          )}

          {/* Test Steps */}
          {testCase.testSteps && testCase.testSteps.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Test Steps
              </h5>
              {testCase.testSteps.map((step, index) => (
                <div key={index} style={{ 
                  marginBottom: '1rem', 
                  backgroundColor: 'white', 
                  padding: '1rem',
                  borderRadius: '6px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#495057', fontSize: '0.85rem' }}>
                      Step {step.stepNumber}:
                    </strong>
                    <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                      {step.action}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: '#495057', fontSize: '0.85rem' }}>
                      Expected:
                    </strong>
                    <span style={{ marginLeft: '0.5rem', color: '#6c757d', fontSize: '0.85rem' }}>
                      {step.expectedResult}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expected Results */}
          {testCase.expectedResults && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Expected Results
              </h5>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {testCase.expectedResults}
              </p>
            </div>
          )}

          {/* Test Data Requirements */}
          {testCase.testDataRequirements && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Test Data Requirements
              </h5>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {testCase.testDataRequirements}
              </p>
            </div>
          )}

          {/* Environment Requirements */}
          {testCase.environmentRequirements && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Environment Requirements
              </h5>
              <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                {testCase.environmentRequirements}
              </p>
            </div>
          )}

          {/* Related Links */}
          {(testCase.prdLink || testCase.relatedRequirements) && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h5 style={{ margin: '0 0 0.5rem 0', color: '#495057', fontSize: '0.9rem', fontWeight: '600' }}>
                Related Information
              </h5>
              {testCase.prdLink && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <a 
                    href={testCase.prdLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#007bff', fontSize: '0.85rem', textDecoration: 'none' }}
                  >
                    📄 PRD Document
                  </a>
                </div>
              )}
              {testCase.relatedRequirements && (
                <p style={{ margin: 0, color: '#6c757d', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
                  {testCase.relatedRequirements}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ 
            display: 'flex', 
            gap: '10px', 
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #dee2e6'
          }}>
            {onExecute && (
              <button
                onClick={() => onExecute(testCase)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                Execute Test
              </button>
            )}
            {canEdit && onEdit && (
              <button
                onClick={() => onEdit(testCase)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                Edit
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(testCase.id)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '500'
                }}
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestCaseCard;