// components/ThemeSwitcher.tsx
'use client'; // This component uses client-side hooks and interactivity

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid';   // Solid style

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // You could return a placeholder button or null
    return (
      <button
        aria-label="Toggle Dark Mode"
        type="button"
        className="p-2 rounded-md opacity-50 cursor-not-allowed"
        disabled
      >
        <MoonIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-500" /> {/* Generic placeholder */}
      </button>
    );
  }

  const currentTheme = resolvedTheme;

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-1.5 sm:p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
    >
      {currentTheme === 'dark' ? (
        <SunIcon className="w-5 h-5 md:w-6 md:h-6 text-custom-purple" />
      ) : (
        <MoonIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
};

export default ThemeSwitcher;