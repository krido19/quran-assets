import { createContext, useContext, useEffect, useState } from 'react';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    const [arabicFontSize, setArabicFontSize] = useState(() => {
        return parseInt(localStorage.getItem('arabic_font_size') || '28');
    });

    const [arabicFontFamily, setArabicFontFamily] = useState(() => {
        return localStorage.getItem('arabic_font_family') || 'Amiri';
    });

    useEffect(() => {
        localStorage.setItem('arabic_font_size', arabicFontSize.toString());
    }, [arabicFontSize]);

    useEffect(() => {
        localStorage.setItem('arabic_font_family', arabicFontFamily);
    }, [arabicFontFamily]);

    return (
        <SettingsContext.Provider value={{
            arabicFontSize,
            setArabicFontSize,
            arabicFontFamily,
            setArabicFontFamily
        }}>
            {children}
        </SettingsContext.Provider>
    );
};
