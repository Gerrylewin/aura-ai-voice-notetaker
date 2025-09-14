
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MigrationResult {
  bookId: string;
  title: string;
  success: boolean;
  error?: string;
  oldUrl?: string;
  newUrl?: string;
}

interface MigrationResponse {
  success: boolean;
  message: string;
  migrated: number;
  failed: number;
  results: MigrationResult[];
}

export function BookCoverMigration() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<MigrationResponse | null>(null);
  const { toast } = useToast();

  const runMigration = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      console.log('🚀 Starting book cover migration...');
      
      const response = await fetch('/functions/v1/migrate-book-covers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MigrationResponse = await response.json();
      setResults(data);

      if (data.success) {
        toast({
          title: 'Migration Completed',
          description: data.message,
        });
      } else {
        toast({
          title: 'Migration Failed',
          description: data.message || 'Unknown error occurred',
          variant: 'destructive',
        });
      }

    } catch (error) {
      console.error('❌ Migration error:', error);
      toast({
        title: 'Migration Error',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Book Cover Migration
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Migrate existing book covers from the avatars bucket to the dedicated book-covers bucket.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            onClick={runMigration}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Migration...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Start Migration
              </>
            )}
          </Button>
          
          {results && (
            <div className="flex items-center gap-2 text-sm">
              {results.success ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
              <span>
                {results.migrated} migrated, {results.failed} failed
              </span>
            </div>
          )}
        </div>

        {results && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Migration Summary</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {results.message}
              </p>
            </div>

            {results.results && results.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Detailed Results:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {results.results.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded border text-sm ${
                        result.success
                          ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200'
                          : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {result.success ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span className="font-medium">{result.title}</span>
                      </div>
                      {result.error && (
                        <p className="text-xs opacity-75">Error: {result.error}</p>
                      )}
                      {result.success && result.newUrl && (
                        <p className="text-xs opacity-75">
                          Migrated to: {result.newUrl.split('/').pop()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
