import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = "" }) => {
  const { isDark, toggleTheme } = useTheme();

  // Switch between light and dark themes
  const handleThemeSwitch = () => {
    toggleTheme();
    console.log(`Switched to ${isDark ? 'light' : 'dark'} mode`);
  };

  return (
    <button
      onClick={handleThemeSwitch}
      className={`group relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Icon with smooth transition */}
      <div className="relative">
        {isDark ? (
          <Sun className="w-5 h-5 transform transition-transform group-hover:rotate-12" />
        ) : (
          <Moon className="w-5 h-5 transform transition-transform group-hover:-rotate-12" />
        )}
      </div>
      
      {/* Subtle hover effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
    </button>
  );
};

export default ThemeToggle;
