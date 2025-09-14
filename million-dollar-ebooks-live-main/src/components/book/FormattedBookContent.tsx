
import React from 'react';

interface FormattedBookContentProps {
  content: string;
  className?: string;
}

export const FormattedBookContent = ({ content, className }: FormattedBookContentProps) => {
  return (
    <div className={`formatted-book-content ${className}`}>
      <style>{`
        .formatted-book-content .prose {
          max-width: none;
          line-height: 1.8;
          font-size: 16px;
          color: #d1d5db;
        }
        
        .formatted-book-content .prose h1 {
          font-size: 2.25rem;
          font-weight: bold;
          margin: 2.5rem 0 1.5rem 0;
          color: white;
          border-bottom: 2px solid #ef4444;
          padding-bottom: 0.75rem;
          text-align: center;
        }
        
        .formatted-book-content .prose h2 {
          font-size: 1.75rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          color: #f3f4f6;
        }
        
        .formatted-book-content .prose h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          color: #e5e7eb;
        }
        
        .formatted-book-content .prose h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem 0;
          color: #e5e7eb;
        }
        
        .formatted-book-content .prose p {
          margin: 1.25rem 0;
          text-align: justify;
          color: #d1d5db;
          text-indent: 1.5rem;
        }
        
        .formatted-book-content .prose p:first-of-type,
        .formatted-book-content .prose h1 + p,
        .formatted-book-content .prose h2 + p,
        .formatted-book-content .prose h3 + p {
          text-indent: 0;
        }
        
        .formatted-book-content .prose blockquote {
          border-left: 4px solid #ef4444;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #9ca3af;
          background: rgba(239, 68, 68, 0.1);
          padding: 1.5rem;
          border-radius: 0.5rem;
        }
        
        .formatted-book-content .prose ul, 
        .formatted-book-content .prose ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        
        .formatted-book-content .prose li {
          margin: 0.75rem 0;
          color: #d1d5db;
        }
        
        .formatted-book-content .prose strong {
          font-weight: bold;
          color: white;
        }
        
        .formatted-book-content .prose em {
          font-style: italic;
          color: #f3f4f6;
        }
        
        .formatted-book-content .prose img {
          max-width: 100%;
          height: auto;
          margin: 2rem auto;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .formatted-book-content .prose .page-break {
          page-break-before: always;
          border-top: 2px dashed #4b5563;
          margin: 3rem 0;
          padding: 1rem 0;
          text-align: center;
          color: #6b7280;
          font-size: 1.125rem;
          background: rgba(75, 85, 99, 0.2);
          border-radius: 0.5rem;
          letter-spacing: 0.5rem;
        }
        
        .formatted-book-content .prose div[class*="chapter"],
        .formatted-book-content .prose div[class*="section"] {
          margin: 2rem 0;
        }
        
        .formatted-book-content .prose table {
          width: 100%;
          margin: 2rem 0;
          border-collapse: collapse;
          color: #d1d5db;
        }
        
        .formatted-book-content .prose th,
        .formatted-book-content .prose td {
          border: 1px solid #4b5563;
          padding: 0.75rem;
          text-align: left;
        }
        
        .formatted-book-content .prose th {
          background: rgba(75, 85, 99, 0.3);
          font-weight: bold;
          color: white;
        }
        
        @media print {
          .formatted-book-content .prose .page-break {
            border: none;
            background: none;
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <div 
        className="prose prose-invert"
        dangerouslySetInnerHTML={{ __html: content }} 
      />
    </div>
  );
};
