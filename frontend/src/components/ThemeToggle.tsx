import LightModeIcon from '@mui/icons-material/LightMode'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDarkMode } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className="theme-toggle-inner">
        {isDarkMode ? (
          <LightModeIcon className="theme-icon sun-icon" sx={{ fontSize: 18 }} />
        ) : (
          <DarkModeIcon className="theme-icon moon-icon" sx={{ fontSize: 18 }} />
        )}
      </div>
    </button>
  );
}