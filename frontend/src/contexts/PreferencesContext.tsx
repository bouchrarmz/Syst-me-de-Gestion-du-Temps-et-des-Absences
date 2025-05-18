import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

// Types pour les préférences utilisateur
type FontFamily = "Roboto" | "Arial" | "Helvetica" | "sans-serif" | "Tahoma" | "Verdana";
type Theme = "light" | "dark";
type Language = "fr" | "en" | "ar";

interface Preferences {
  theme: Theme;
  fontFamily: FontFamily;
  language: Language;
}

interface PreferencesContextType {
  preferences: Preferences;
  setTheme: (theme: Theme) => void;
  setFontFamily: (fontFamily: FontFamily) => void;
  setLanguage: (language: Language) => void;
}

// Valeurs par défaut
const defaultPreferences: Preferences = {
  theme: "light",
  fontFamily: "Roboto",
  language: "fr"
};

// Création du contexte
const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

// Provider du contexte
export const PreferencesProvider = ({ children }: { children: ReactNode }) => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const storedPreferences = localStorage.getItem("userPreferences");
    return storedPreferences ? JSON.parse(storedPreferences) : defaultPreferences;
  });

  useEffect(() => {
    localStorage.setItem("userPreferences", JSON.stringify(preferences));
    // Thème
    const root = document.documentElement;
    if (preferences.theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Police globale
    document.body.style.fontFamily = preferences.fontFamily;
  }, [preferences]);
  
  const setTheme = (theme: Theme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setFontFamily = (fontFamily: FontFamily) => {
    setPreferences((prev) => ({ ...prev, fontFamily }));
  };

  const setLanguage = (language: Language) => {
    setPreferences((prev) => ({ ...prev, language }));
  };

  // Valeur du contexte
  const value = {
    preferences,
    setTheme,
    setFontFamily,
    setLanguage
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
