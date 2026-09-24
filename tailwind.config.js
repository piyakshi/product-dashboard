/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom dark "techy SaaS" palette — deliberately not the default
        // slate/blue combo every template uses. Deep ink background,
        // acid-green accent (think terminal / monitoring-tool energy).
        ink: {
          950: "#07090c",
          900: "#0c0f14",
          850: "#11151c",
          800: "#161b24",
          700: "#1f2530",
          600: "#2a3140",
          500: "#3d4759",
        },
        mist: {
          400: "#8b95a7",
          300: "#aab3c2",
          200: "#c9d0da",
          100: "#e7eaef",
        },
        accent: {
          DEFAULT: "#7CFFB2",   // acid green
          dim: "#4fd98f",
          glow: "#a6ffce",
        },
        warn: "#ffb454",
        danger: "#ff6b6b",
        info: "#5ec8ff",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,255,178,0.15), 0 0 24px rgba(124,255,178,0.08)",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
};
