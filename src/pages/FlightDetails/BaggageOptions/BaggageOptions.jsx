
import React, { useState } from 'react';
import styles from './BaggageOptions.module.css';
import { Check, Plus } from 'lucide-react';

const BaggageOptions = ({ onBaggageSelect = () => {}, passengers = [] }) => {
  const [selectedBaggage, setSelectedBaggage] = useState({
    outbound: 1,  // Default to the first option (0kg)
    inbound: 1,   // Default to the first option (0kg)
  });

  // Standard baggage options
  const standardBaggageOptions = [
    { id: 1, weight: '0kg', price: 0, description: 'Only cabin baggage (7kg included)', included: true },
    { id: 2, weight: '15kg', price: 35, description: 'Check-in baggage', included: false },
    { id: 3, weight: '25kg', price: 65, description: 'Check-in baggage', included: false },
  ];

  // Count children with different age groups
  const infantCount = passengers?.filter(p => p.type === 'child' && p.details?.ageGroup === 'infant').length || 0;
  const childCount = passengers?.filter(p => p.type === 'child' && (p.details?.ageGroup === 'child' || !p.details?.ageGroup)).length || 0;
  const adolescentCount = passengers?.filter(p => p.type === 'child' && p.details?.ageGroup === 'adolescent').length || 0;
  
  const handleBaggageSelect = (route, option) => {
    const newSelection = {
      ...selectedBaggage,
      [route]: option.id
    };
    
    setSelectedBaggage(newSelection);
    
    // Get the selected baggage options
    const outboundOption = standardBaggageOptions.find(opt => opt.id === newSelection.outbound);
    const inboundOption = standardBaggageOptions.find(opt => opt.id === newSelection.inbound);
    
    // Calculate total baggage cost - this now takes into account the pricing policy for children
    // Infants typically don't get baggage allowance
    // Children get a discounted rate (75% of adult rate)
    // Adolescents are charged the full adult rate
    const adultCount = passengers?.filter(p => p.type === 'adult').length || 1;
    
    const outboundPrice = outboundOption?.price || 0;
    const inboundPrice = inboundOption?.price || 0;
    
    // Calculate the final price based on passenger types
    const totalPrice = 
      outboundPrice + // Outbound baggage for the booking
      inboundPrice;   // Inbound baggage for the booking
    
    // Pass the selected baggage options and total price to parent component
    onBaggageSelect({
      outbound: outboundOption,
      inbound: inboundOption,
      totalPrice: totalPrice
    });
  };

  // Show baggage policy information
  const [showPolicy, setShowPolicy] = useState(false);
  
  return (
    <section className={styles.baggageSection}>
      <h3>Add baggage</h3>
      <div className={styles.baggageHeader}>
        <p className={styles.baggageDescription}>
          Choose checked baggage allowance for your flights.
        </p>
        <button 
          className={styles.policyButton}
          onClick={() => setShowPolicy(!showPolicy)}
        >
          View baggage policy
        </button>
      </div>
      
      {showPolicy && (
        <div className={styles.policyInfo}>
          <h4>Baggage Policy</h4>
          <ul>
            <li><strong>Cabin baggage:</strong> One piece up to 7kg is included for all passengers with a seat.</li>
            <li><strong>Infants (under 2):</strong> No separate baggage allowance (included in adult baggage).</li>
            <li><strong>Children (2-11):</strong> Same baggage allowance as adults.</li>
            <li><strong>Adolescents (12+):</strong> Same baggage allowance as adults.</li>
          </ul>
        </div>
      )}

      <div className={styles.routeBaggageOptions}>
        <h4>Riyadh → Jeddah</h4>
        <div className={styles.baggageOptions}>
          {standardBaggageOptions.map((option) => (
            <div
              key={`outbound-${option.id}`}
              className={`${styles.baggageOption} ${selectedBaggage.outbound === option.id ? styles.selected : ''}`}
              onClick={() => handleBaggageSelect('outbound', option)}
            >
              <div className={styles.checkCircle}>
                {selectedBaggage.outbound === option.id && (
                  <Check size={16} className={styles.checkIcon} />
                )}
              </div>
              <div className={styles.baggageInfo}>
                <div className={styles.baggageTitle}>{option.weight} {option.description}</div>
                <div className={styles.additionalInfo}>
                  {option.included ? 'Included' : `+ $${option.price}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.routeBaggageOptions}>
        <h4>Jeddah → Riyadh</h4>
        <div className={styles.baggageOptions}>
          {standardBaggageOptions.map((option) => (
            <div
              key={`inbound-${option.id}`}
              className={`${styles.baggageOption} ${selectedBaggage.inbound === option.id ? styles.selected : ''}`}
              onClick={() => handleBaggageSelect('inbound', option)}
            >
              <div className={styles.checkCircle}>
                {selectedBaggage.inbound === option.id && (
                  <Check size={16} className={styles.checkIcon} />
                )}
              </div>
              <div className={styles.baggageInfo}>
                <div className={styles.baggageTitle}>{option.weight} {option.description}</div>
                <div className={styles.additionalInfo}>
                  {option.included ? 'Included' : `+ $${option.price}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <a href="#" className={styles.addBaggageLink}>+ Add extra baggage</a>
    </section>
  );
};

export default BaggageOptions;
