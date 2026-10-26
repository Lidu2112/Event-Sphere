import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext({ lang: 'en', setLang: () => { } });

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState(() => {
        try {
            const saved = localStorage.getItem('selectedLanguage');
            return saved === 'am' ? 'am' : 'en';
        } catch {
            return 'en';
        }
    });

    // Sync body class and fire event whenever lang changes
    useEffect(() => {
        document.body.classList.toggle('lang-am', lang === 'am');
        window.dispatchEvent(new CustomEvent('languageChange', { detail: { language: lang } }));
    }, [lang]);

    function setLang(newLang) {
        if (newLang !== 'en' && newLang !== 'am') return;
        try { localStorage.setItem('selectedLanguage', newLang); } catch { }
        setLangState(newLang);
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLang() {
    return useContext(LanguageContext);
}
