
import React, { useState, useEffect } from 'react';
import { ModernBookReader } from './ModernBookReader';

interface BookReaderProps {
  content: string;
  title: string;
  bookId?: string;
  onClose: () => void;
}

export function BookReader({ content, title, bookId, onClose }: BookReaderProps) {
  return (
    <ModernBookReader 
      content={content}
      title={title}
      bookId={bookId}
      onClose={onClose}
    />
  );
}
