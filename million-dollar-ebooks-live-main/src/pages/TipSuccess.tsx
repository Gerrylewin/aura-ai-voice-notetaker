
import React from 'react';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TipSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Header />
      <main className="pt-32">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="w-16 h-16 text-green-500" />
                  <Heart className="w-6 h-6 text-red-500 absolute -bottom-1 -right-1" />
                </div>
              </div>
              <CardTitle className="text-2xl text-gray-900 dark:text-white">
                Thank You for Your Generosity!
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Your tip has been successfully processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white">
                  Your tip helps support independent authors and keeps great content coming. 
                  The author will receive 90% of your tip, with 10% going to platform maintenance.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Return to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/discover')}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Discover More Books
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
