
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Users } from 'lucide-react';

export function AnalyticsInsightsTab() {
  const insights = [
    {
      type: 'success',
      title: 'Strong Engagement',
      description: 'Your completion rate is 68%, which is above average for digital books.'
    },
    {
      type: 'warning',
      title: 'Mobile Optimization',
      description: '65% of readers use mobile devices. Consider optimizing for mobile reading experience.'
    },
    {
      type: 'info',
      title: 'Peak Reading Time',
      description: 'Most engagement happens between 7-9 PM. Schedule promotions accordingly.'
    },
    {
      type: 'success',
      title: 'Chapter Performance',
      description: 'Chapter 5 has the highest engagement time, indicating strong interest in advanced content.'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI-Powered Insights</h3>
        {insights.map((insight, index) => (
          <Card key={index} className={`border-l-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${
            insight.type === 'success' ? 'border-l-green-500' :
            insight.type === 'warning' ? 'border-l-yellow-500' :
            'border-l-blue-500'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  insight.type === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                  insight.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {insight.type === 'success' && <TrendingUp className="w-4 h-4 text-green-600" />}
                  {insight.type === 'warning' && <Target className="w-4 h-4 text-yellow-600" />}
                  {insight.type === 'info' && <Users className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{insight.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Optimize for Mobile:</strong> Consider shorter paragraphs and larger fonts for better mobile reading experience.</p>
          </div>
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Promote Chapter 5:</strong> This chapter has high engagement - consider creating supplementary content.</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-gray-700 dark:text-gray-300"><strong>Evening Promotions:</strong> Schedule social media posts between 6-8 PM for maximum visibility.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
