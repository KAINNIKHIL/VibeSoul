import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {

  const [isDark, setIsDark] = useState(() => {
    const themeFromStorage = localStorage.getItem("theme");

    if (themeFromStorage) {
      return themeFromStorage === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const html = document.documentElement;

    if (isDark) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);