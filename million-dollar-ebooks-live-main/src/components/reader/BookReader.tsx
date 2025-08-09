
import React, { useState, useEffect } from 'react';
import { EnhancedBookReader } from './EnhancedBookReader';

interface BookReaderProps {
  content: string;
  title: string;
  bookId?: string;
  onClose: () => void;
}

export function BookReader({ content, title, bookId, onClose }: BookReaderProps) {
  return (
    <EnhancedBookReader
      content={content}
      title={title}
      bookId={bookId}
      onClose={onClose}
    />
  );
}
