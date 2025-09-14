
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { APP_CONFIG } from '@/config/app';

interface SocialShareButtonProps {
  title: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  authorImageUrl?: string;
  platform?: 'twitter' | 'facebook' | 'linkedin' | 'native';
  size?: 'sm' | 'default' | 'lg';
}

export function SocialShareButton({
  title,
  description = '',
  url,
  imageUrl,
  authorImageUrl,
  platform = 'native',
  size = 'sm'
}: SocialShareButtonProps) {
  const { trackSocialShare } = useAnalytics();

  // Use provided URL or construct clean URL with dollarebooks.app domain
  const shareUrl = url || `${APP_CONFIG.baseUrl}${window.location.pathname}`;
  
  // Use author image first, then provided image, then default
  const socialImage = authorImageUrl || imageUrl || `${APP_CONFIG.baseUrl}/lovable-uploads/41d6c92c-08df-42d6-abd8-bf3735f498ca.png`;
  
  const handleShare = async () => {
    const shareData = {
      title,
      text: description,
      url: shareUrl
    };
    
    trackSocialShare(platform, shareData);
    
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else if (platform === 'twitter') {
      const hashtags = 'MillionDollarEbooks,Story';
      const twitterText = `${title}\n\n${description}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
      window.open(twitterUrl, '_blank');
    } else if (platform === 'facebook') {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(`${title} - ${description}`)}&picture=${encodeURIComponent(socialImage)}`;
      window.open(facebookUrl, '_blank');
    } else if (platform === 'linkedin') {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`;
      window.open(linkedinUrl, '_blank');
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${title} - ${shareUrl}`);
      alert('Link copied to clipboard!');
    }
  };

  const getIcon = () => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-4 h-4" />;
      case 'facebook':
        return <Facebook className="w-4 h-4" />;
      case 'linkedin':
        return <Linkedin className="w-4 h-4" />;
      default:
        return <Share2 className="w-4 h-4" />;
    }
  };

  const getLabel = () => {
    switch (platform) {
      case 'twitter':
        return 'Tweet';
      case 'facebook':
        return 'Share';
      case 'linkedin':
        return 'Share';
      default:
        return 'Share';
    }
  };

  return (
    <Button 
      variant="outline" 
      size={size} 
      onClick={handleShare} 
      className="bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:text-gray-900 w-full justify-center"
    >
      {getIcon()}
      <span className="ml-2 hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}
