import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1a2b3c",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e6e6e6",
          foreground: "#1a2b3c",
        },
        accent: {
          DEFAULT: "#00ff9d",
          foreground: "#1a2b3c",
        },
        highlight: {
          DEFAULT: "#ff6b6b",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        retro: ["VT323", "monospace"],
        pixel: ["Press Start 2P", "cursive"],
      },
      keyframes: {
        "pixel-fade": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px #00ff9d, 0 0 10px #00ff9d, 0 0 15px #00ff9d",
          },
          "50%": {
            boxShadow: "0 0 10px #00ff9d, 0 0 20px #00ff9d, 0 0 30px #00ff9d",
          },
        },
      },
      animation: {
        "pixel-fade": "pixel-fade 0.3s ease-in-out",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;