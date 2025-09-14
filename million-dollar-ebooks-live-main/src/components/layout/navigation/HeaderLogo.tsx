import React from 'react';
import { Link } from 'react-router-dom';
export function HeaderLogo() {
  return <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors px-0 mx-[15px]">
      <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
        <span className="text-white font-bold text-sm">M</span>
      </div>
      <span className="hidden sm:block">Million Dollar eBooks</span>
      <span className="sm:hidden">MDE</span>
    </Link>;
}