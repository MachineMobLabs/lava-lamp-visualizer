import { useState } from 'react';
import '../styles/LicenseModal.css';

interface LicenseModalProps {
  onValidate: (email: string, key: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LicenseModal({ onValidate, isLoading, error }: LicenseModalProps) {
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [step, setStep] = useState<'input' | 'loading' | 'error'>('input');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !key.trim()) {
      setStep('error');
      return;
    }

    setStep('loading');
    const isValid = await onValidate(email.trim(), key.trim());

    if (!isValid) {
      setStep('error');
    }
    // If valid, the parent component will hide this modal
  };

  const handleRetry = () => {
    setStep('input');
  };

  if (isLoading && step === 'loading') {
    return (
      <div className="license-modal-overlay">
        <div className="license-modal">
          <div className="license-loader">
            <div className="pulse"></div>
            <p>Validating license...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="license-modal-overlay">
      <div className="license-modal">
        <div className="license-header">
          <h2>Audio Visualizer</h2>
          <p>Enter your email and license key to unlock</p>
        </div>

        {step === 'input' && (
          <form onSubmit={handleSubmit} className="license-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="key">License Key</label>
              <input
                id="key"
                type="text"
                placeholder="Your license key"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <button type="submit" disabled={isLoading} className="unlock-button">
              {isLoading ? 'Validating...' : 'Unlock'}
            </button>

            <p className="license-hint">
              Don't have a license? Get one at{' '}
              <a href="https://gumroad.com" target="_blank" rel="noopener noreferrer">
                Gumroad
              </a>
            </p>
          </form>
        )}

        {step === 'error' && (
          <div className="license-error">
            <p className="error-message">{error || 'Invalid email or license key'}</p>
            <button onClick={handleRetry} className="retry-button">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
