/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "var(--color-primary)",
                "background-light": "var(--bg-app)",
                "background-dark": "var(--bg-panel)", // Using panel bg for dark mode equivalent or generic dark
                "sand": "var(--bg-hover)",
                "khaki": "var(--text-tertiary)",
                "charcoal": "var(--text-main)",
                "cycle": {
                    1: "var(--color-cycle-1)",
                    2: "var(--color-cycle-2)",
                    3: "var(--color-cycle-3)",
                    4: "var(--color-cycle-4)",
                    5: "var(--color-cycle-5)",
                }
            },
            fontFamily: {
                "display": ["Manrope", "sans-serif"],
                "serif": ["Playfair Display", "serif"],
                "sans": ["Manrope", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "full": "9999px"
            },
        },
    },
    plugins: [],
}
