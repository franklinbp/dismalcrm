import React, { createContext, useState, useContext, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { createMuiTheme, ThemeProvider as MUIThemeProvider } from "@material-ui/core/styles";
import { CssBaseline } from "@material-ui/core";
import { ptBR } from "@material-ui/core/locale";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [locale, setLocale] = useState();

  const toggleTheme = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    if (!i18nlocale || i18nlocale.length < 5) {
      return;
    }

    const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  const theme = useMemo(() => {
    const palette = darkMode
      ? {
          type: "dark",
          primary: { main: "#6EA8FE" },
          secondary: { main: "#F1C27D" },
          background: {
            default: "#0D1117",
            paper: "#151B26",
          },
          text: {
            primary: "#E6EDF3",
            secondary: "#B4C0CC",
          },
        }
      : {
          type: "light",
          primary: { main: "#0A2540" },
          secondary: { main: "#1B9CFC" },
          background: {
            default: "#FFFFFF",
            paper: "#FFFFFF",
          },
          text: {
            primary: "#1F2933",
            secondary: "#A5B1C2",
          },
        };

    const paperShadow = darkMode
      ? "0 12px 32px rgba(0, 0, 0, 0.45)"
      : "0 12px 32px rgba(10, 37, 64, 0.12)";

    return createMuiTheme(
      {
        palette,
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: '"Manrope", "Segoe UI", sans-serif',
          h1: { fontWeight: 700, letterSpacing: "-0.02em" },
          h2: { fontWeight: 700, letterSpacing: "-0.02em" },
          h3: { fontWeight: 700 },
          h4: { fontWeight: 700 },
          h5: { fontWeight: 600 },
          h6: { fontWeight: 600 },
          subtitle1: { fontWeight: 500 },
          button: { fontWeight: 600, textTransform: "none" },
        },
        overrides: {
          MuiCssBaseline: {
            "@global": {
              ":root": {
                "--brand-primary": palette.primary.main,
                "--brand-secondary": palette.secondary.main,
                "--brand-surface": palette.background.paper,
              },
              body: {
                background: darkMode
                  ? palette.background.default
                  : "linear-gradient(180deg, #FFFFFF 0%, #F3F6FA 100%)",
                color: palette.text.primary,
                minHeight: "100vh",
              },
              a: {
                color: palette.primary.main,
              },
              "*::-webkit-scrollbar": {
                width: "8px",
                height: "8px",
              },
              "*::-webkit-scrollbar-thumb": {
                backgroundColor: darkMode ? "#2B3442" : "#CBD5E1",
                borderRadius: "8px",
              },
            },
          },
          MuiPaper: {
            rounded: {
              borderRadius: 14,
            },
            elevation1: {
              boxShadow: paperShadow,
            },
          },
          MuiButton: {
            root: {
              borderRadius: 12,
              padding: "10px 18px",
            },
            containedPrimary: {
              boxShadow: paperShadow,
            },
          },
          MuiOutlinedInput: {
            root: {
              backgroundColor: darkMode ? "#111827" : "#F8FAFC",
              borderRadius: 12,
            },
            notchedOutline: {
              borderColor: darkMode ? "#283241" : "#D4DDEB",
            },
          },
        },
      },
      locale
    );
  }, [darkMode, locale]);

  const contextValue = useMemo(() => ({ darkMode, toggleTheme }), [darkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useThemeContext = () => useContext(ThemeContext);
