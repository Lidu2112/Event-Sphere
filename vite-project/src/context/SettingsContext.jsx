import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/admin';

const SettingsContext = createContext(null);

const DEFAULTS = {
    platformName: 'EventSphere',
    supportEmail: 'support@eventsphere.com',
    commissionRate: 10,
    allowSelfRegistration: true,
    requireOrganizerApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    twoFactorAuth: false,
    maintenanceMode: false,
};

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(DEFAULTS);
    const [loaded, setLoaded] = useState(false);

    // Load from backend on mount
    useEffect(() => {
        api.getSettings()
            .then(data => { setSettings(data.settings); setLoaded(true); })
            .catch(() => setLoaded(true)); // use defaults on error
    }, []);

    // Called after a successful save — updates context with new values
    function applySettings(newSettings) {
        setSettings(s => ({ ...s, ...newSettings }));
    }

    return (
        <SettingsContext.Provider value={{ settings, applySettings, loaded }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}
