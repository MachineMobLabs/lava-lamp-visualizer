import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import '../styles/LicenseModal.css';
export function LicenseModal({ onValidate, isLoading, error }) {
    const [email, setEmail] = useState('');
    const [key, setKey] = useState('');
    const [step, setStep] = useState('input');
    const handleSubmit = async (e) => {
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
        return (_jsx("div", { className: "license-modal-overlay", children: _jsx("div", { className: "license-modal", children: _jsxs("div", { className: "license-loader", children: [_jsx("div", { className: "pulse" }), _jsx("p", { children: "Validating license..." })] }) }) }));
    }
    return (_jsx("div", { className: "license-modal-overlay", children: _jsxs("div", { className: "license-modal", children: [_jsxs("div", { className: "license-header", children: [_jsx("h2", { children: "Audio Visualizer" }), _jsx("p", { children: "Enter your email and license key to unlock" })] }), step === 'input' && (_jsxs("form", { onSubmit: handleSubmit, className: "license-form", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "email", children: "Email" }), _jsx("input", { id: "email", type: "email", placeholder: "you@example.com", value: email, onChange: (e) => setEmail(e.target.value), disabled: isLoading, required: true })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { htmlFor: "key", children: "License Key" }), _jsx("input", { id: "key", type: "text", placeholder: "Your license key", value: key, onChange: (e) => setKey(e.target.value), disabled: isLoading, required: true })] }), _jsx("button", { type: "submit", disabled: isLoading, className: "unlock-button", children: isLoading ? 'Validating...' : 'Unlock' }), _jsxs("p", { className: "license-hint", children: ["Don't have a license? Get one at", ' ', _jsx("a", { href: "https://gumroad.com", target: "_blank", rel: "noopener noreferrer", children: "Gumroad" })] })] })), step === 'error' && (_jsxs("div", { className: "license-error", children: [_jsx("p", { className: "error-message", children: error || 'Invalid email or license key' }), _jsx("button", { onClick: handleRetry, className: "retry-button", children: "Try Again" })] }))] }) }));
}
