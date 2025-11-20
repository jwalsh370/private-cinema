// Workaround for Turbopack Tailwind issue
const { transform } = require('tailwindcss/lib/css/preflight.css');
module.exports = { transform };
