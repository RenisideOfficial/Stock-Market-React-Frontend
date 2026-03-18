// main.tsx - FIXED with proper types
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
  defineStyleConfig,
  GlobalStyle,
  type ThemeConfig,
  type StyleFunctionProps,
} from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import { mode } from "@chakra-ui/theme-tools";

import { cardAnatomy } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(cardAnatomy.keys);

const accentColor = localStorage.getItem("accentColor") || "cyan";

// Custom component styles
const Button = defineStyleConfig({
  baseStyle: {
    fontWeight: "600",
    borderRadius: "lg",
  },
  variants: {
    solid: {
      bg: `${accentColor}.500`,
      color: "white",
      _hover: {
        bg: `${accentColor}.600`,
        transform: "translateY(-2px)",
        boxShadow: "lg",
      },
      _active: {
        bg: `${accentColor}.700`,
        transform: "translateY(0)",
      },
      transition: "all 0.2s",
    },
    outline: {
      borderColor: `${accentColor}.500`,
      color: `${accentColor}.500`,
      _hover: {
        bg: `${accentColor}.50`,
        transform: "translateY(-2px)",
        boxShadow: "md",
      },
      transition: "all 0.2s",
    },
    ghost: {
      _hover: {
        bg: `${accentColor}.50`,
        transform: "translateY(-1px)",
      },
      transition: "all 0.2s",
    },
  },
  defaultProps: {
    size: "md",
    variant: "solid",
  },
});

const Card = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    container: {
      borderRadius: "xl",
      overflow: "hidden",
      transition: "all 0.2s",
      _hover: {
        transform: "translateY(-2px)",
        boxShadow: "xl",
      },
    },
  }),
  variants: {
    elevated: definePartsStyle({
      container: {
        boxShadow: "md",
      },
    }),
  },
  defaultProps: {
    variant: "elevated",
  },
});

const config: ThemeConfig = {
  initialColorMode: "system",
  useSystemColorMode: true,
};

const customTheme = extendTheme(
  withDefaultColorScheme({ colorScheme: accentColor }),
  {
    config,
    styles: {
      global: (props: StyleFunctionProps) => ({
        body: {
          bg: mode("gray.50", "gray.900")(props),
          color: mode("gray.800", "whiteAlpha.900")(props),
          transition: "background-color 0.2s",
        },
        "::placeholder": {
          color: mode("gray.400", "whiteAlpha.400")(props),
        },
        "*, *::before, *::after": {
          borderColor: mode("gray.200", "gray.700")(props),
        },
      }),
    },
    fonts: {
      heading: `'Manrope', sans-serif`,
      body: `'Inter', sans-serif`,
    },
    components: {
      Button,
      Card,
      Spinner: {
        baseStyle: {
          color: `${accentColor}.500`,
          borderWidth: "3px",
        },
        defaultProps: {
          size: "xl",
        },
      },
      Link: {
        baseStyle: (props: StyleFunctionProps) => ({
          color: mode(`${accentColor}.500`, `${accentColor}.300`)(props),
          fontWeight: "500",
          _hover: {
            textDecoration: "none",
            color: mode(`${accentColor}.600`, `${accentColor}.400`)(props),
          },
        }),
      },
      Heading: {
        baseStyle: {
          fontWeight: "600",
          letterSpacing: "tight",
        },
      },
      Text: {
        baseStyle: {
          lineHeight: "tall",
        },
      },
      Badge: {
        baseStyle: {
          borderRadius: "full",
          px: 2,
          py: 0.5,
          fontWeight: "500",
        },
      },
      Progress: {
        baseStyle: {
          filledTrack: {
            borderRadius: "full",
          },
          track: {
            borderRadius: "full",
          },
        },
      },
      Input: {
        variants: {
          outline: (props: StyleFunctionProps) => ({
            field: {
              borderRadius: "lg",
              borderColor: mode("gray.200", "gray.700")(props),
              _focus: {
                borderColor: mode(
                  `${accentColor}.500`,
                  `${accentColor}.300`,
                )(props),
                boxShadow: `0 0 0 1px ${mode(`${accentColor}.500`, `${accentColor}.300`)(props)}`,
              },
            },
          }),
        },
        defaultProps: {
          variant: "outline",
        },
      },
      Modal: {
        baseStyle: (props: StyleFunctionProps) => ({
          dialog: {
            bg: mode("white", "gray.800")(props),
            borderRadius: "2xl",
          },
        }),
      },
      Drawer: {
        baseStyle: (props: StyleFunctionProps) => ({
          dialog: {
            bg: mode(
              "rgba(255, 255, 255, 0.9)",
              "rgba(26, 32, 44, 0.9)",
            )(props),
            backdropFilter: "blur(10px)",
          },
        }),
      },
    },
    colors: {
      cyan: {
        50: "#e0f7fa",
        100: "#b2ebf2",
        200: "#80deea",
        300: "#4dd0e1",
        400: "#26c6da",
        500: "#00b8d4",
        600: "#00a0c4",
        700: "#0088b4",
        800: "#0070a3",
        900: "#005893",
      },
    },
    shadows: {
      outline: `0 0 0 3px rgba(0, 184, 212, 0.6)`,
    },
  },
);

// Ensure the root element exists
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={customTheme}>
        <GlobalStyle />
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
