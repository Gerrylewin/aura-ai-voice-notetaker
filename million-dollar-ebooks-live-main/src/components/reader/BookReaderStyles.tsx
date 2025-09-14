
import React from 'react';

export function BookReaderStyles() {
  return (
    <style>
      {`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600&display=swap');
        
        .book-content p:first-child::first-letter,
        .book-content .prose p:first-of-type::first-letter {
          float: left;
          font-size: 3.5em;
          line-height: 1;
          margin-right: 8px;
          margin-top: 0;
          margin-bottom: -4px;
          font-weight: bold;
          color: #92400e;
        }
        
        .book-content p::first-letter {
          float: left;
          font-size: 2.5em;
          line-height: 1;
          margin-right: 6px;
          margin-top: 0;
          margin-bottom: -3px;
          font-weight: bold;
          color: #92400e;
        }
        
        .book-content p {
          text-indent: 0;
          margin-bottom: 1em;
        }
        
        .book-content p:first-child,
        .book-content .prose p:first-of-type {
          text-indent: 0;
        }
      `}
    </style>
  );
}
