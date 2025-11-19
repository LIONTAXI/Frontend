/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oryu: "rgb(234 42 17)",

        black: {
          10: "rgb(245 245 245)",
          15: "rgb(237 237 237)",
          20: "rgb(214 214 214)",
          40: "rgb(170 170 170)",
          50: "rgb(119 119 119)",
          70: "rgb(68 68 68)",
          90: "rgb(34 34 34)",
        },

        orange: {
          sub: "rgb(255 244 223)",
          main: "rgb(252 126 42)",
        },
      },

      fontFamily: {
        pretendard: ["Pretendard", "sans-serif"],
      },

      fontSize: {
        // Headings
        "head-bold-24": ["24px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "700",
        }],
        "head-bold-20": ["20px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "700",
        }],
        "head-semibold-20": ["20px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "600",
        }],
        "head-regular-20": ["20px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "400",
        }],

        // Body
        "body-bold-18": ["18px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "700",
        }],
        "body-bold-16": ["16px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "700",
        }],
        "body-semibold-16": ["16px", {
          lineHeight: "normal",
          letterSpacing: "0em",
          fontWeight: "600",
        }],
        "body-regular-16": ["16px", {
          lineHeight: "1.4",
          letterSpacing: "0em",
          fontWeight: "500",
        }],

        "body-semibold-14": ["14px", {
          lineHeight: "1.4",
          letterSpacing: "0em",
          fontWeight: "600",
        }],
        "body-regular-14": ["14px", {
          lineHeight: "1.4",
          letterSpacing: "0em",
          fontWeight: "400",
        }],
      },
    },
  },
  plugins: [],
};
