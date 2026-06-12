import { useState, useEffect } from 'react';

interface LicenseData {
  key: string;
  validatedAt: string;
}

interface UseLicenseValidationReturn {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
  validateLicense: (key: string) => Promise<boolean>;
  clearLicense: () => void;
}

const STORAGE_KEY = 'visualizer_license';

export function useLicenseValidation(): UseLicenseValidationReturn {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        JSON.parse(stored);
        setIsValid(true);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to load license from storage:', err);
      localStorage.removeItem(STORAGE_KEY);
      setIsValid(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateLicense = async (key: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string) || window.location.origin;
      const response = await fetch(`${apiBaseUrl}/api/validate-license`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          license_key: key.trim(),
        }),
      });

      const data = await response.json();

      if (data.valid) {
        // Store license data
        const licenseData: LicenseData = {
          key: key.trim(),
          validatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(licenseData));

        setIsValid(true);
        setIsLoading(false);
        return true;
      } else {
        setError(data.error || 'Invalid license key');
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const clearLicense = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsValid(false);
    setError(null);
  };

  return {
    isValid,
    isLoading,
    error,
    validateLicense,
    clearLicense,
  };
}
