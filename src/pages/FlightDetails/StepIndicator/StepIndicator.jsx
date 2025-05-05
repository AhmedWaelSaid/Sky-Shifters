
import React from 'react';
import './StepIndicator.css';

const StepIndicator = ({ currentStep }) => {
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
          
          return (
            <div 
              key={step.number} 
              className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
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
