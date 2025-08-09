
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TipAuthorModal } from './TipAuthorModal';
import { Heart } from 'lucide-react';

interface TipAuthorButtonProps {
  authorId: string;
  authorName: string;
  bookId?: string;
  bookTitle?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function TipAuthorButton({ 
  authorId, 
  authorName, 
  bookId, 
  bookTitle,
  variant = 'default',
  size = 'default',
  className = ''
}: TipAuthorButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={`${className} ${variant === 'default' ? 'bg-red-600 hover:bg-red-700' : ''}`}
      >
        <Heart className="w-4 h-4 mr-2" />
        Tip Author
      </Button>
      
      <TipAuthorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        authorId={authorId}
        authorName={authorName}
        bookId={bookId}
        bookTitle={bookTitle}
      />
    </>
  );
}
