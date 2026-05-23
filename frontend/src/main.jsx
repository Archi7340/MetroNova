import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #F0EFF8;
    --surface:   #FFFFFF;
    --card:      #EAE8F5;
    --border:    #D8D5ED;
    --accent:    #6C63FF;
    --accent2:   #A89CFF;
    --text:      #1A1730;
    --muted:     #7B7894;
    --green:     #34C98A;
    --amber:     #F5A623;
    --red:       #F05252;
    --blue:      #4A90E2;
    --shadow:    0 2px 20px rgba(108,99,255,0.10);
    --shadow-md: 0 8px 40px rgba(108,99,255,0.14);
    --radius:    16px;
    --radius-sm: 10px;
  }

  html, body, #root { height: 100%; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  select option { background: #fff; color: var(--text); }
  optgroup { color: var(--muted); font-weight: 600; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
