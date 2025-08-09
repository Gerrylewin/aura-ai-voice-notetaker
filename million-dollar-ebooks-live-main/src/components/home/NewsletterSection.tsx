
import React from 'react';
import { NewsletterSignup } from '@/components/newsletter/NewsletterSignup';

export function NewsletterSection() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Never Miss a Great Story
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Get notified about new book releases, exclusive author content, and special promotions directly in your inbox.
          </p>
        </div>
        
        <div className="flex justify-center">
          <NewsletterSignup />
        </div>
      </div>
    </section>
  );
}
