const backgroundColor = localStorage.getItem("ARCONNECT_THEME_BACKGROUND_COLOR");
const textColor = localStorage.getItem("ARCONNECT_THEME_TEXT_COLOR");

if (backgroundColor) document.documentElement.style.setProperty('--backgroundColor', backgroundColor);
if (textColor) document.documentElement.style.setProperty('--textColor', textColor);
