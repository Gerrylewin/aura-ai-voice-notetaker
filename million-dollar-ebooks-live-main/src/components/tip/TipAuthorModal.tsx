
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Heart, DollarSign } from 'lucide-react';

interface TipAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorId: string;
  authorName: string;
  bookId?: string;
  bookTitle?: string;
}

export function TipAuthorModal({ 
  isOpen, 
  onClose, 
  authorId, 
  authorName, 
  bookId, 
  bookTitle 
}: TipAuthorModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = [5, 10, 25, 50, 100];

  const handleTip = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum < 1) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a tip amount of at least $1.00',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-tip-payment', {
        body: {
          amount_cents: Math.round(amountNum * 100),
          author_id: authorId,
          book_id: bookId,
          tip_message: message,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: 'Redirecting to Payment',
        description: 'Opening Stripe checkout in a new tab...',
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error creating tip payment:', error);
      toast({
        title: 'Payment Error',
        description: error.message || 'Failed to process tip payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Tip {authorName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {bookTitle ? `Show appreciation for "${bookTitle}"` : 'Show appreciation for their great work'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Predefined amounts */}
          <div>
            <Label className="text-white mb-3 block">Quick amounts</Label>
            <div className="grid grid-cols-5 gap-2">
              {predefinedAmounts.map((predefinedAmount) => (
                <Button
                  key={predefinedAmount}
                  variant="outline"
                  className="border-gray-600 text-white hover:bg-gray-700"
                  onClick={() => setAmount(predefinedAmount.toString())}
                >
                  ${predefinedAmount}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <Label htmlFor="amount" className="text-white">Custom Amount (USD)</Label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
            </div>
          </div>

          {/* Optional message */}
          <div>
            <Label htmlFor="message" className="text-white">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Thank you for the amazing content!"
              className="bg-gray-800 border-gray-600 text-white mt-2"
              rows={3}
            />
          </div>

          {/* Fee info */}
          {amount && parseFloat(amount) >= 1 && (
            <div className="bg-gray-800 p-3 rounded-lg text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Tip amount:</span>
                <span>${parseFloat(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Platform fee (10%):</span>
                <span>${(parseFloat(amount) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white font-medium border-t border-gray-600 pt-2 mt-2">
                <span>Author receives:</span>
                <span>${(parseFloat(amount) * 0.9).toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleTip}
              disabled={!amount || parseFloat(amount) < 1 || isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 'Processing...' : `Tip $${amount || '0'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
