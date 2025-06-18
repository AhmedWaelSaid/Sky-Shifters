import React from 'react';
import styles from './ProgressSteps.module.css';

const ProgressSteps = ({ currentStep = 4 }) => {
  const steps = [
    { id: 1, title: 'اختر رحلتك', label: 'Choose your flight' },
    { id: 2, title: 'أدخل بياناتك', label: 'Enter your details' },
    { id: 3, title: 'ترقية تجربتك', label: 'Upgrade your experience' },
    { id: 4, title: 'التفاصيل النهائية', label: 'Final details' }
  ];

  return (
    <div className={styles.progressContainer}>
      <div className={styles.stepsWrapper}>
        {steps.map((step, index) => (
          <div key={step.id} className={styles.stepContainer}>
            <div className={styles.stepItem}>
              <div 
                className={`${styles.stepCircle} ${
                  step.id <= currentStep ? styles.completed : styles.pending
                }`}
              >
                {step.id <= currentStep ? (
                  <svg className={styles.checkIcon} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className={styles.stepNumber}>{step.id}</span>
                )}
              </div>
              <div className={styles.stepContent}>
                <div className={`${styles.stepTitle} ${step.id === currentStep ? styles.active : ''}`}>
                  {step.label}
                </div>
                <div className={styles.stepSubtitle}>{step.title}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`${styles.stepConnector} ${
                  step.id < currentStep ? styles.completed : styles.pending
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps;

