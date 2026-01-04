export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                mana: {
                    primary: '#6b21a8', // Purple/Black mana feel
                    accent: '#d946ef', // Pinkish accent
                    dark: '#1e1b4b', // Deep indigo
                    light: '#f5d0fe',
                },
                surface: {
                    dark: '#0f172a', // Slate 900
                    card: '#1e293b', // Slate 800
                    lighter: '#334155', // Slate 700
                },
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
