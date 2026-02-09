import React, { useState, useEffect } from 'react';

export default function PricingExceptionForm() {
  const [formData, setFormData] = useState({
    loanOfficer: '',
    loanNumber: '',
    borrowerLastName: '',
    loanPurpose: '',
    product: '',
    loanAmount: '',
    rate: '',
    borrowerPaidPoints: '',
    totalPrice: '',
    netPricing: '',
    competitor: '',
    branchSource: '',
    pexNote: ''
  });

  const [showAttestation, setShowAttestation] = useState(false);
  const [attestationConfirmed, setAttestationConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const loanPurposes = ['Purchase', 'Refinance', 'Renovation', 'HELOC/2nds'];
  
  const products = [
    'CONF 30 Yr',
    'CONF 15 Yr',
    'CONF 30 Yr HB',
    'CONF 15 Yr HB',
    'FHA 30 Yr',
    'FHA 15 Yr',
    'FHA 30 Yr HB',
    'FHA 15 Yr HB',
    'VA 30 Yr',
    'VA 15 Yr',
    'VA 30 Yr HB',
    'VA 15 Yr HB'
  ];

  // Check if attestation warning should show - only after BOTH Total Price and Borrower Paid Points are entered
  useEffect(() => {
    const netPrice = parseFloat(formData.netPricing);
    const hasTotalPrice = formData.totalPrice && formData.totalPrice !== '';
    const hasBorrowerPoints = formData.borrowerPaidPoints && formData.borrowerPaidPoints !== '';
    
    // Only show if BOTH fields are filled AND the calculated net price is below 99.5
    if (hasTotalPrice && hasBorrowerPoints && !isNaN(netPrice) && netPrice < 99.5) {
      setShowAttestation(true);
    } else {
      setShowAttestation(false);
      setAttestationConfirmed(false);
    }
  }, [formData.netPricing, formData.totalPrice, formData.borrowerPaidPoints]);

  // Auto-calculate Net Pricing when Total Price or Borrower Paid Points change
  useEffect(() => {
    const totalPrice = parseFloat(formData.totalPrice) || 0;
    const borrowerPoints = parseFloat(formData.borrowerPaidPoints) || 0;
    
    if (formData.totalPrice || formData.borrowerPaidPoints) {
      const calculatedNet = totalPrice + borrowerPoints;
      setFormData(prev => ({
        ...prev,
        netPricing: calculatedNet.toFixed(2)
      }));
    }
  }, [formData.totalPrice, formData.borrowerPaidPoints]);

  // Calculate pricing exceptions
  const calculateExceptions = () => {
    const netPrice = parseFloat(formData.netPricing) || 0;
    const loanAmt = parseFloat(formData.loanAmount) || 0;
    
    const bps = netPrice - 100;
    const dollarAmount = (bps / 100) * loanAmt;
    
    return {
      bps: bps.toFixed(2),
      dollars: dollarAmount.toFixed(2)
    };
  };

  const exceptions = calculateExceptions();

  // Determine color based on BPS value
  const getBpsColor = () => {
    const bps = parseFloat(exceptions.bps);
    
    if (bps >= -0.50) {
      return {
        background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
        border: '2px solid #6ee7b7',
        color: '#059669'
      };
    } else if (bps >= -0.75) {
      return {
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #fbbf24',
        color: '#d97706'
      };
    } else {
      return {
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        border: '2px solid #f87171',
        color: '#dc2626'
      };
    }
  };

  const bpsColorStyle = getBpsColor();

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const copyToEmail = () => {
    const emailContent = `PRICING EXCEPTION REQUEST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOAN OFFICER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Loan Officer: ${formData.loanOfficer || '[Not Provided]'}
Loan Number: ${formData.loanNumber || '[Not Provided]'}
Borrower Last Name: ${formData.borrowerLastName || '[Not Provided]'}

LOAN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Loan Purpose: ${formData.loanPurpose || '[Not Selected]'}
Product: ${formData.product || '[Not Selected]'}
Loan Amount: $${formData.loanAmount ? parseFloat(formData.loanAmount).toLocaleString() : '[Not Provided]'}
Rate: ${formData.rate || '[Not Provided]'}%

PRICING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Borrower Paid Points: ${formData.borrowerPaidPoints || '[Not Provided]'}
Total Price (Net before points): ${formData.totalPrice || '[Not Provided]'}
Net Pricing: ${formData.netPricing || '[Not Provided]'}
${showAttestation && attestationConfirmed ? `
⚠️ ATTESTATION REQUIRED
Loan Officer Attestation will be uploaded to BlueSage
` : ''}
PRICING EXCEPTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Pricing Exception (Bps): ${exceptions.bps}
Total Pricing Exception ($): $${parseFloat(exceptions.dollars).toLocaleString()}

COMPETITIVE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Competitor: ${formData.competitor || '[Not Provided]'}
Branch Source Code: ${formData.branchSource || '[Not Selected]'}

PEX NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.pexNote || '[No additional notes provided]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(emailContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const openEmail = () => {
    const subject = encodeURIComponent(
      `PEX Loan # ${formData.loanNumber || '[Loan #]'} | ${formData.borrowerLastName || '[Borrower]'} | NET Pricing ${formData.netPricing || '[NET]'} | ${formData.product || '[Product]'}`
    );
    const body = encodeURIComponent(`PRICING EXCEPTION REQUEST

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LOAN OFFICER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Loan Officer: ${formData.loanOfficer || '[Not Provided]'}
Loan Number: ${formData.loanNumber || '[Not Provided]'}
Borrower Last Name: ${formData.borrowerLastName || '[Not Provided]'}

LOAN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Loan Purpose: ${formData.loanPurpose || '[Not Selected]'}
Product: ${formData.product || '[Not Selected]'}
Loan Amount: $${formData.loanAmount ? parseFloat(formData.loanAmount).toLocaleString() : '[Not Provided]'}
Rate: ${formData.rate || '[Not Provided]'}%

PRICING INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Borrower Paid Points: ${formData.borrowerPaidPoints || '[Not Provided]'}
Total Price (Net before points): ${formData.totalPrice || '[Not Provided]'}
Net Pricing: ${formData.netPricing || '[Not Provided]'}
${showAttestation && attestationConfirmed ? `
⚠️ ATTESTATION REQUIRED
Loan Officer Attestation will be uploaded to BlueSage
` : ''}
PRICING EXCEPTION ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Pricing Exception (Bps): ${exceptions.bps}
Total Pricing Exception ($): $${parseFloat(exceptions.dollars).toLocaleString()}

COMPETITIVE INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Competitor: ${formData.competitor || '[Not Provided]'}
Branch Source Code: ${formData.branchSource || '[Not Selected]'}

PEX NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${formData.pexNote || '[No additional notes provided]'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted: ${new Date().toLocaleString()}`);

    window.location.href = `mailto:rosario.lawrence@primelending.com?subject=${subject}&body=${body}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%)',
      padding: '2rem 1rem',
      fontFamily: '"Inter Tight", system-ui, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 500px;
            transform: translateY(0);
          }
        }
        
        .fade-in {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .input-field {
          background: white;
          border: 2px solid #e0e7ff;
          color: #1e293b;
          padding: 0.875rem 1rem;
          border-radius: 10px;
          font-family: 'Inter Tight', sans-serif;
          font-size: 0.9375rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
        }
        
        .input-field:focus {
          outline: none;
          border-color: #6366f1;
          background: #fafbff;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }
        
        .input-field::placeholder {
          color: #94a3b8;
        }
        
        select.input-field {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236366f1' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-color: white;
          padding-right: 2.5rem;
        }
        
        .form-section {
          background: white;
          border: 1px solid #e0e7ff;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.08);
        }
        
        .calc-card {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          border: 2px solid #c7d2fe;
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
        }
        
        .calc-label {
          font-size: 0.8125rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .calc-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 1.75rem;
          font-weight: 700;
          color: #6366f1;
        }
        
        .attestation-warning {
          animation: slideDown 0.4s ease-out;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 2px solid #fbbf24;
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 1rem;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .checkbox-container:hover {
          background: rgba(251, 191, 36, 0.15);
        }
        
        .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #94a3b8;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .checkbox:checked {
          background: #6366f1;
          border-color: #6366f1;
        }
        
        .copy-button {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
          font-family: 'Inter Tight', sans-serif;
        }
        
        .copy-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.35);
        }
        
        .copy-button:active {
          transform: translateY(0);
        }
        
        .copy-button.copied {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
      `}</style>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div className="fade-in" style={{ 
          textAlign: 'center', 
          marginBottom: '2.5rem'
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem',
            letterSpacing: '-0.03em'
          }}>
            The Collective PEX Form
          </h1>
          <div style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#6366f1',
            marginBottom: '0.5rem'
          }}>
            PrimeLending
          </div>
          <div style={{
            fontSize: '0.9375rem',
            fontWeight: '500',
            color: '#64748b',
            marginBottom: '0.75rem'
          }}>
            Westlake Village • Petaluma • Oxnard
          </div>
          <p style={{
            color: '#64748b',
            fontSize: '1rem',
            fontWeight: '500'
          }}>
            Complete the form below to submit your pricing exception
          </p>
        </div>

        {/* Loan Officer */}
        <div className="form-section fade-in" style={{ animationDelay: '0.1s' }}>
          <label style={{
            display: 'block',
            color: '#6366f1',
            fontWeight: '600',
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Loan Officer Information
          </label>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#475569',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Loan Officer Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter loan officer name"
                value={formData.loanOfficer}
                onChange={(e) => handleChange('loanOfficer', e.target.value)}
              />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Loan Number
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter loan number"
                  value={formData.loanNumber}
                  onChange={(e) => handleChange('loanNumber', e.target.value)}
                />
              </div>
              
              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Borrower Last Name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter borrower last name"
                  value={formData.borrowerLastName}
                  onChange={(e) => handleChange('borrowerLastName', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loan Details */}
        <div className="form-section fade-in" style={{ animationDelay: '0.2s' }}>
          <h2 style={{
            color: '#1e293b',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em'
          }}>
            Loan Details
          </h2>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Loan Purpose
                </label>
                <select
                  className="input-field"
                  value={formData.loanPurpose}
                  onChange={(e) => handleChange('loanPurpose', e.target.value)}
                >
                  <option value="">Select purpose...</option>
                  {loanPurposes.map(purpose => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Product
                </label>
                <select
                  className="input-field"
                  value={formData.product}
                  onChange={(e) => handleChange('product', e.target.value)}
                >
                  <option value="">Select product...</option>
                  {products.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#475569',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Loan Amount
              </label>
              <input
                type="number"
                className="input-field"
                placeholder="Enter loan amount"
                value={formData.loanAmount}
                onChange={(e) => handleChange('loanAmount', e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Rate (%)
                </label>
                <input
                  type="number"
                  step="0.001"
                  className="input-field"
                  placeholder="e.g., 6.750"
                  value={formData.rate}
                  onChange={(e) => handleChange('rate', e.target.value)}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Borrower Paid Points
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="e.g., 1.00"
                  value={formData.borrowerPaidPoints}
                  onChange={(e) => handleChange('borrowerPaidPoints', e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Total Price (Net before points to borrower)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="e.g., 98.00"
                  value={formData.totalPrice}
                  onChange={(e) => handleChange('totalPrice', e.target.value)}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: '#475569',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem'
                }}>
                  Net Pricing (Auto-Calculated)
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  placeholder="Calculated automatically"
                  value={formData.netPricing}
                  readOnly
                  style={{
                    background: '#eef2ff',
                    cursor: 'not-allowed',
                    border: '2px solid #c7d2fe'
                  }}
                />
              </div>
            </div>

            {/* Attestation Warning */}
            {showAttestation && (
              <div className="attestation-warning">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    fontSize: '1.5rem'
                  }}>⚠️</div>
                  <div style={{
                    flex: 1
                  }}>
                    <div style={{
                      color: '#ea580c',
                      fontWeight: '700',
                      fontSize: '1rem',
                      marginBottom: '0.25rem'
                    }}>
                      Attestation Required
                    </div>
                    <div style={{
                      color: '#d97706',
                      fontSize: '0.875rem'
                    }}>
                      Net pricing below 99.5 requires a Loan Officer Attestation to be submitted to BlueSage
                    </div>
                  </div>
                </div>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={attestationConfirmed}
                    onChange={(e) => setAttestationConfirmed(e.target.checked)}
                  />
                  <span style={{
                    color: '#78350f',
                    fontSize: '0.9375rem',
                    fontWeight: '500'
                  }}>
                    I confirm the Loan Officer Attestation will be uploaded to BlueSage
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Exception Analysis */}
        <div className="form-section fade-in" style={{ animationDelay: '0.3s' }}>
          <h2 style={{
            color: '#1e293b',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em'
          }}>
            Pricing Exception Analysis
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem' 
          }}>
            <div className="calc-card" style={{
              background: bpsColorStyle.background,
              border: bpsColorStyle.border
            }}>
              <div className="calc-label">Exception (Bps)</div>
              <div className="calc-value" style={{ color: bpsColorStyle.color }}>
                {exceptions.bps}
              </div>
            </div>
            
            <div className="calc-card" style={{
              background: bpsColorStyle.background,
              border: bpsColorStyle.border
            }}>
              <div className="calc-label">Exception ($)</div>
              <div className="calc-value" style={{ color: bpsColorStyle.color }}>
                ${parseFloat(exceptions.dollars).toLocaleString()}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              color: '#64748b',
              fontSize: '0.8125rem',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#6366f1' }}>Formula:</strong> Total Pricing Exception (Bps) = Net Pricing - 100 | 
              Total Pricing Exception ($) = (Bps ÷ 100) × Loan Amount
            </div>
          </div>
        </div>

        {/* Competitive Information */}
        <div className="form-section fade-in" style={{ animationDelay: '0.4s' }}>
          <h2 style={{
            color: '#1e293b',
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            letterSpacing: '-0.01em'
          }}>
            Competitive Information
          </h2>
          
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div>
              <label style={{
                display: 'block',
                color: '#475569',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Competitor
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter competitor name"
                value={formData.competitor}
                onChange={(e) => handleChange('competitor', e.target.value)}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#475569',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Branch Source Code
              </label>
              <select
                className="input-field"
                value={formData.branchSource}
                onChange={(e) => handleChange('branchSource', e.target.value)}
              >
                <option value="">Select source...</option>
                <option value="Internal">Internal</option>
                <option value="External">External</option>
                <option value="N/A">N/A</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                color: '#475569',
                fontWeight: '500',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                PEX Notes
              </label>
              <textarea
                className="input-field"
                placeholder="Enter notes on what you're competing against and matching..."
                value={formData.pexNote}
                onChange={(e) => handleChange('pexNote', e.target.value)}
                rows="4"
                style={{
                  resize: 'vertical',
                  fontFamily: 'Inter Tight, sans-serif'
                }}
              />
            </div>
          </div>
        </div>

        {/* Email Submission Buttons */}
        <div className="form-section fade-in" style={{ animationDelay: '0.5s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              className="copy-button"
              onClick={openEmail}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
              }}
            >
              ✉️ Open in Email
            </button>
            
            <button
              className={`copy-button ${copied ? 'copied' : ''}`}
              onClick={copyToEmail}
              style={{
                background: copied 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
                border: copied ? 'none' : '2px solid #c7d2fe'
              }}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
          
          <div style={{
            marginTop: '1rem',
            textAlign: 'center',
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Send to: <strong style={{ color: '#6366f1' }}>rosario.lawrence@primelending.com</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
