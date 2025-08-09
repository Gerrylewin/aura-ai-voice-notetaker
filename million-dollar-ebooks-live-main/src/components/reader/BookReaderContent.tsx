import React from 'react';
import { BookReader as BookReaderComponent } from '@/components/reader/BookReader';

interface BookReaderContentProps {
  content: string;
  title: string;
  bookId: string;
  onClose: () => void;
}

export function BookReaderContent({ content, title, bookId, onClose }: BookReaderContentProps) {
  return (
    <BookReaderComponent
      content={content}
      title={title}
      bookId={bookId}
      onClose={onClose}
    />
  );
}