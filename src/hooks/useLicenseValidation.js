import { useState, useEffect } from 'react';
const STORAGE_KEY = 'visualizer_license';
export function useLicenseValidation() {
    const [isValid, setIsValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    // Check localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const licenseData = JSON.parse(stored);
                setEmail(licenseData.email);
                setIsValid(true);
                setError(null);
            }
        }
        catch (err) {
            console.error('Failed to load license from storage:', err);
            localStorage.removeItem(STORAGE_KEY);
            setIsValid(false);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const validateLicense = async (inputEmail, key) => {
        setIsLoading(true);
        setError(null);
        try {
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
            const response = await fetch(`${apiBaseUrl}/api/validate-license`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: inputEmail.toLowerCase(),
                    key: key.trim(),
                }),
            });
            const data = await response.json();
            if (data.valid) {
                // Store license data
                const licenseData = {
                    email: inputEmail.toLowerCase(),
                    key: key.trim(),
                    validatedAt: new Date().toISOString(),
                };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(licenseData));
                setIsValid(true);
                setEmail(inputEmail.toLowerCase());
                setIsLoading(false);
                return true;
            }
            else {
                setError(data.error || 'Invalid license key');
                setIsLoading(false);
                return false;
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Network error';
            setError(errorMessage);
            setIsLoading(false);
            return false;
        }
    };
    const clearLicense = () => {
        localStorage.removeItem(STORAGE_KEY);
        setIsValid(false);
        setEmail('');
        setError(null);
    };
    return {
        isValid,
        isLoading,
        error,
        email,
        validateLicense,
        clearLicense,
    };
}
