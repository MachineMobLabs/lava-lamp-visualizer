import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useLicenseValidation } from '../hooks/useLicenseValidation';
import { LicenseModal } from './LicenseModal';
export function ProtectedContent({ children }) {
    const { isValid, isLoading, error, validateLicense } = useLicenseValidation();
    if (isLoading) {
        return (_jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }, children: _jsxs("div", { style: { textAlign: 'center', color: '#999' }, children: [_jsx("div", { style: {
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #ff8c00, #ff6b35)',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'pulse 1.5s ease-in-out infinite'
                        } }), _jsx("p", { children: "Loading..." })] }) }));
    }
    return (_jsxs(_Fragment, { children: [!isValid && (_jsx(LicenseModal, { onValidate: validateLicense, isLoading: isLoading, error: error })), isValid && children] }));
}
