import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy, Users, Zap, Bug, Lightbulb, AlertTriangle, Sparkles, Coins } from 'lucide-react';
import { releaseNotesData } from './release-notes-data';
import { ReleaseNotificationManager } from './ReleaseNotificationManager';
import { useAuth } from '@/hooks/useAuth';
export const ReleaseNotes = () => {
  const {
    profile
  } = useAuth();
  const isAdmin = profile?.user_role === 'admin';
  const getVersionBadgeColor = (type: string) => {
    switch (type) {
      case 'major':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'feature':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'bugfix':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'improvement':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };
  const getVersionIcon = (type: string) => {
    switch (type) {
      case 'major':
        return <Sparkles className="w-4 h-4" />;
      case 'feature':
        return <Lightbulb className="w-4 h-4" />;
      case 'bugfix':
        return <Bug className="w-4 h-4" />;
      case 'improvement':
        return <Zap className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };
  const releaseNotes = releaseNotesData;
  const latestRelease = releaseNotes[0];
  return <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Release Notes & Updates
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Latest updates, new features, and improvements to Million Dollar eBooks.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Crypto Payment System Announcement */}
          

          {/* Admin notification manager for latest release */}
          {isAdmin && latestRelease && <ReleaseNotificationManager version={latestRelease.version} title={latestRelease.title} description={latestRelease.highlights.join('. ') || 'Major platform update with new features and improvements.'} />}

          {releaseNotes.map((release, index) => <div key={index} className="border-l-4 border-red-600 pl-6 pb-8 last:pb-0">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getVersionBadgeColor(release.type)} flex items-center gap-1`}>
                  {getVersionIcon(release.type)}
                  {release.type}
                </Badge>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  v{release.version}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {release.date}
                </span>
                {index === 0 && <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Latest
                  </Badge>}
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {release.title}
              </h4>
              
              {/* Highlights Section */}
              {release.highlights && release.highlights.length > 0 && <div className="mb-4">
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    {release.highlights.map((highlight, highlightIndex) => <li key={highlightIndex} className="flex items-start">
                        <span className="text-red-600 mr-2 mt-1">•</span>
                        {highlight}
                      </li>)}
                  </ul>
                </div>}

              {/* Performance Metrics for major releases */}
              {release.metrics && <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {Object.entries(release.metrics).map(([key, value]) => <div key={key} className="text-center">
                      <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{key}</div>
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">{value}</div>
                    </div>)}
                </div>}

              <div className="space-y-4">
                {release.changes.map((changeGroup, groupIndex) => <div key={groupIndex}>
                    {changeGroup.category && <h5 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-red-600" />
                        {changeGroup.category}
                      </h5>}
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300 ml-6">
                      {changeGroup.items.map((change, changeIndex) => <li key={changeIndex} className="flex items-start">
                          <span className="text-red-600 mr-2 mt-1">•</span>
                          {change}
                        </li>)}
                    </ul>
                  </div>)}
              </div>
            </div>)}

          {/* What's Coming Next Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
              What's Coming After Crypto Launch
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span><strong>Enhanced Chat Features:</strong> File sharing, group conversations, and advanced moderation tools</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span><strong>Advanced Analytics:</strong> Crypto earnings tracking and detailed creator insights</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span><strong>Mobile App:</strong> Native iOS and Android applications with crypto wallet integration</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span><strong>AI Reading Recommendations:</strong> Personalized book suggestions powered by blockchain data</span>
              </div>
              <div className="flex items-start">
                <span className="text-purple-600 mr-2 mt-1">•</span>
                <span><strong>Creator NFTs:</strong> Special edition books and exclusive content as NFTs</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};