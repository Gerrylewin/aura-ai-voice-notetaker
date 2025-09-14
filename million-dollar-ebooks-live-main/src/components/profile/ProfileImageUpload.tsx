
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string | null;
  onImageUpdated: (url: string | null) => void;
}

export function ProfileImageUpload({ userId, currentImageUrl, onImageUpdated }: ProfileImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file.');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB.');
      }

      // First, delete ALL existing avatars for this user to ensure only one exists
      console.log('Cleaning up existing avatars for user:', userId);
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${userId}/${file.name}`);
        console.log('Deleting existing files:', filesToDelete);
        
        const { error: deleteError } = await supabase.storage
          .from('avatars')
          .remove(filesToDelete);
          
        if (deleteError) {
          console.log('Could not delete some existing avatars:', deleteError);
          // Don't throw error, continue with upload
        }
      }

      // Upload new file with a simple filename (always the same name to replace)
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;

      console.log('Uploading new avatar to:', fileName);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // This will overwrite if exists
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      console.log('New avatar URL:', publicUrl);

      // Update profile in database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      // Notify parent component
      onImageUpdated(publicUrl);
      
      toast({
        title: 'Success',
        description: 'Avatar uploaded successfully!',
      });

    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload avatar.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {currentImageUrl ? (
            <AvatarImage 
              src={currentImageUrl} 
              alt="Profile" 
              className="object-cover"
            />
          ) : null}
          <AvatarFallback className="bg-red-600 text-white text-xl">
            <Camera className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex flex-col items-center space-y-2">
        <input
          type="file"
          id="avatar-upload"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
        <label htmlFor="avatar-upload">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </span>
          </Button>
        </label>
        <p className="text-xs text-gray-500">
          Max 5MB. Supports JPG, PNG, GIF, WebP
        </p>
      </div>
    </div>
  );
}
