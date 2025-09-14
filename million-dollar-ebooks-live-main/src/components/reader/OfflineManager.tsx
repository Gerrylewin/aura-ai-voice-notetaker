import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  CheckCircle, 
  AlertCircle, 
  Wifi, 
  WifiOff,
  BookOpen,
  Trash2,
  HardDrive,
  Clock
} from 'lucide-react';

interface OfflineBook {
  id: string;
  title: string;
  author_name: string;
  cover_image_url?: string;
  content: string;
  downloadedAt: string;
  size: number;
}

interface OfflineManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentBook?: {
    id: string;
    title: string;
    author_name: string;
    cover_image_url?: string;
    content: string;
  };
}

export function OfflineManager({ isOpen, onClose, currentBook }: OfflineManagerProps) {
  const [offlineBooks, setOfflineBooks] = useState<OfflineBook[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadOfflineBooks();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineBooks = useCallback(() => {
    try {
      const stored = localStorage.getItem('offline_books');
      if (stored) {
        const books = JSON.parse(stored);
        setOfflineBooks(books);
      }
    } catch (error) {
      console.error('Failed to load offline books:', error);
    }
  }, []);

  const saveOfflineBooks = useCallback((books: OfflineBook[]) => {
    try {
      localStorage.setItem('offline_books', JSON.stringify(books));
      setOfflineBooks(books);
    } catch (error) {
      console.error('Failed to save offline books:', error);
      toast({
        title: 'Storage Error',
        description: 'Failed to save offline books. Storage may be full.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const downloadBook = async () => {
    if (!currentBook) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      // Simulate download progress
      const progressInterval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create offline book object
      const offlineBook: OfflineBook = {
        id: currentBook.id,
        title: currentBook.title,
        author_name: currentBook.author_name,
        cover_image_url: currentBook.cover_image_url,
        content: currentBook.content,
        downloadedAt: new Date().toISOString(),
        size: new Blob([currentBook.content]).size
      };

      // Add to offline books
      const updatedBooks = [...offlineBooks, offlineBook];
      saveOfflineBooks(updatedBooks);

      setDownloadProgress(100);
      
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
        toast({
          title: 'Download Complete',
          description: `"${currentBook.title}" is now available offline.`,
        });
      }, 500);

    } catch (error) {
      setIsDownloading(false);
      setDownloadProgress(0);
      toast({
        title: 'Download Failed',
        description: 'Failed to download book for offline reading.',
        variant: 'destructive',
      });
    }
  };

  const removeOfflineBook = (bookId: string) => {
    const updatedBooks = offlineBooks.filter(book => book.id !== bookId);
    saveOfflineBooks(updatedBooks);
    
    toast({
      title: 'Book Removed',
      description: 'Book has been removed from offline storage.',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTotalStorageUsed = () => {
    return offlineBooks.reduce((total, book) => total + book.size, 0);
  };

  const isBookDownloaded = (bookId: string) => {
    return offlineBooks.some(book => book.id === bookId);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Offline Reading</CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Badge variant="default" className="bg-accent">
                <Wifi className="w-3 h-3 mr-1" />
                Online
              </Badge>
            ) : (
              <Badge variant="secondary">
                <WifiOff className="w-3 h-3 mr-1" />
                Offline
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto">
          {/* Current Book Download */}
          {currentBook && !isBookDownloaded(currentBook.id) && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  {currentBook.cover_image_url && (
                    <img 
                      src={currentBook.cover_image_url} 
                      alt={currentBook.title}
                      className="w-16 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{currentBook.title}</h3>
                    <p className="text-sm text-muted-foreground">{currentBook.author_name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <HardDrive className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(new Blob([currentBook.content]).size)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {isDownloading ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Downloading...</span>
                      <span className="text-sm text-muted-foreground">{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} className="h-2" />
                  </div>
                ) : (
                  <Button 
                    onClick={downloadBook}
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={!isOnline}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download for Offline Reading
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Offline Books List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Downloaded Books</h3>
              <div className="text-sm text-muted-foreground">
                {formatFileSize(getTotalStorageUsed())} used
              </div>
            </div>

            {offlineBooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No books downloaded for offline reading</p>
                <p className="text-sm mt-2">
                  Download books to read them without an internet connection
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {offlineBooks.map((book) => (
                  <Card key={book.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {book.cover_image_url && (
                          <img 
                            src={book.cover_image_url} 
                            alt={book.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium line-clamp-1">{book.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {book.author_name}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(book.downloadedAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <HardDrive className="w-3 h-3" />
                              {formatFileSize(book.size)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Offline
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOfflineBook(book.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Storage Info */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-accent mb-2">Offline Reading Benefits</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-accent" />
                  <span>Read without internet connection</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-accent" />
                  <span>Books stored locally on your device</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-accent" />
                  <span>Full reading experience offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  <span>Automatic sync when online</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
