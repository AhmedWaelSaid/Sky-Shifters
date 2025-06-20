import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep, onStepChange }) => {
  const steps = [
    { number: 1, title: 'Choose your flight' },
    { number: 2, title: 'Enter your details' },
    { number: 3, title: 'Upgrade your experience' },
    { number: 4, title: 'Final details' }
  ];

  return (
    <div className="steps-container">
      <div className="steps">
        {steps.map((step, index) => {
          const isCompleted = index + 1 < currentStep;
          const isActive = index + 1 === currentStep;
          const isClickable = isCompleted;
          
          return (
            <div
              key={step.number}
              className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isClickable ? 'clickable' : ''}`}
              onClick={() => isClickable && onStepChange && onStepChange(step.number)}
              style={isClickable ? { cursor: 'pointer' } : {}}
            >
              <div className="step-indicator">
                {isCompleted ? (
                  <div className="check-icon">✓</div>
                ) : (
                  step.number
                )}
              </div>
              <div className="step-title">{step.title}</div>
              {index < steps.length - 1 && (
                <div className="connector" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
