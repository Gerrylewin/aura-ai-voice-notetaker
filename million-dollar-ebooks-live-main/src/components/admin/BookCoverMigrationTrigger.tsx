
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function BookCoverMigrationTrigger() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const runMigration = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      console.log('🚀 Starting book cover migration...');
      
      const { data, error } = await supabase.functions.invoke('migrate-book-covers', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('✅ Migration completed:', data);
      setResults(data);

      toast({
        title: 'Migration Completed',
        description: `Successfully migrated ${data.migrated || 0} book covers`,
      });

    } catch (error) {
      console.error('❌ Migration failed:', error);
      toast({
        title: 'Migration Failed',
        description: error.message || 'Failed to migrate book covers',
        variant: 'destructive',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Book Cover Migration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Migrate all existing book covers from the avatars bucket to the book-covers bucket.
        </p>
        
        <Button 
          onClick={runMigration} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Migrating...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Run Migration
            </>
          )}
        </Button>

        {results && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {results.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-medium">Migration Results</span>
            </div>
            
            <div className="text-sm space-y-1">
              <p>Migrated: {results.migrated || 0}</p>
              <p>Failed: {results.failed || 0}</p>
              {results.message && <p className="text-gray-600">{results.message}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
