
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart } from 'lucide-react';
import { useThankMessages } from '@/hooks/useThankMessages';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  giftId: string;
  bookTitle: string;
  giftFrom: string;
}

export function ThankYouModal({ isOpen, onClose, giftId, bookTitle, giftFrom }: ThankYouModalProps) {
  const [message, setMessage] = useState('');
  const { sendThankYou } = useThankMessages();

  const handleSendThankYou = async () => {
    await sendThankYou.mutateAsync({
      giftId,
      message: message.trim() || undefined
    });
    onClose();
    setMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Send Thank You Message
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400">Thanking {giftFrom} for:</p>
            <p className="font-semibold">{bookTitle}</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Your thank you message (optional)
            </label>
            <Textarea
              placeholder="Thank you so much for this wonderful book! I really appreciate your thoughtfulness..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-gray-800 border-gray-700"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSendThankYou}
              disabled={sendThankYou.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <Heart className="w-4 h-4 mr-2" />
              {sendThankYou.isPending ? 'Sending...' : 'Send Thank You'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
