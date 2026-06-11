import { ReactNode } from 'react';
import { useLicenseValidation } from '../hooks/useLicenseValidation';
import { LicenseModal } from './LicenseModal';

interface ProtectedContentProps {
  children: ReactNode;
}

export function ProtectedContent({ children }: ProtectedContentProps) {
  const { isValid, isLoading, error, validateLicense } = useLicenseValidation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ textAlign: 'center', color: '#999' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #ff8c00, #ff6b35)',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!isValid && (
        <LicenseModal
          onValidate={validateLicense}
          isLoading={isLoading}
          error={error}
        />
      )}
      {isValid && children}
    </>
  );
}
