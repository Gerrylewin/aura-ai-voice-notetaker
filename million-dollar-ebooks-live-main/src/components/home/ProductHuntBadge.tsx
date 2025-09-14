
import React from 'react';

export const ProductHuntBadge = () => {
  return (
    <div className="flex justify-center mb-8">
      <a 
        href="https://www.producthunt.com/products/million-dollar-ebooks?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-million%E2%80%90dollar%E2%80%90ebooks" 
        target="_blank" 
        rel="noopener noreferrer"
        className="transform hover:scale-105 transition-transform duration-300"
      >
        <img 
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=972518&theme=light&t=1749473310703" 
          alt="Million Dollar eBooks - Discover Fresh Voices & Support Rising Authors for Just $1 | Product Hunt" 
          style={{ width: '250px', height: '54px' }} 
          width="250" 
          height="54" 
          className="rounded-lg shadow-lg"
        />
      </a>
    </div>
  );
};
