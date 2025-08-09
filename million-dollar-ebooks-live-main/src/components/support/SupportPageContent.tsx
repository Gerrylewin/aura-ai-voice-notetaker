
import React from 'react';
import { SupportRequestForm } from './SupportRequestForm';

export const SupportPageContent = () => {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Support & Help</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Get help with your account or report issues. We're here to help!
        </p>
      </div>

      <div className="grid gap-8">
        <SupportRequestForm />
      </div>
    </>
  );
};
