
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Zap, ThumbsDown, ChevronLeft, ChevronRight, RefreshCw, ArrowRight, TrendingUp } from 'lucide-react';
import { useDailyWinner } from '@/hooks/useDailyWinner';
import { useStories } from '@/hooks/useStories';
import { format, subDays, addDays } from 'date-fns';
import { Link } from 'react-router-dom';

export function DailyWinner() {
  const { winner, loading, fetchDailyWinner } = useDailyWinner();
  const { stories } = useStories();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const dateString = currentDate.toISOString().split('T')[0];
    console.log('DailyWinner: Fetching winner for date:', dateString);
    fetchDailyWinner(dateString);
  }, [fetchDailyWinner, currentDate]);

  const goToPreviousDay = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const goToNextDay = () => {
    const tomorrow = addDays(new Date(), 1);
    if (currentDate < tomorrow) {
      setCurrentDate(prev => addDays(prev, 1));
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const dateString = currentDate.toISOString().split('T')[0];
    console.log('DailyWinner: Manual refresh for date:', dateString);
    
    try {
      await fetchDailyWinner(dateString);
    } catch (error) {
      console.error('Error refreshing winner:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isToday = currentDate.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
  const isFuture = currentDate > new Date();
  const isPastDate = currentDate.toISOString().split('T')[0] < new Date().toISOString().split('T')[0];

  // Calculate leading story for today (highest scoring story so far)
  const getLeadingStory = () => {
    if (!isToday || !stories.length) return null;
    
    // Filter stories for today only
    const todayString = new Date().toISOString().split('T')[0];
    const todayStories = stories.filter(story => story.story_date === todayString);
    
    if (todayStories.length === 0) return null;
    
    return todayStories.reduce((leading, story) => {
      const storyScore = (story.reactions.heart * 3) + (story.reactions.shock * 2) - story.reactions['thumbs-down'];
      const leadingScore = leading ? (leading.reactions.heart * 3) + (leading.reactions.shock * 2) - leading.reactions['thumbs-down'] : -1;
      
      return storyScore > leadingScore ? story : leading;
    }, null);
  };

  const leadingStory = getLeadingStory();

  if (loading && !isRefreshing) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  // Show leading story for today, winner for past dates
  const displayData = isToday && !winner ? leadingStory : winner;
  const isShowingLeader = isToday && !winner && leadingStory;

  return (
    <Card className={displayData ? "bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            {isShowingLeader ? (
              <>
                <TrendingUp className="w-5 h-5 mr-2 text-yellow-500" />
                Leading Story for {format(currentDate, 'MMMM d, yyyy')}
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
                Daily Winner for {format(currentDate, 'MMMM d, yyyy')}
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToPreviousDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={goToNextDay}
              disabled={isFuture}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!displayData ? (
          <div className="text-center py-8">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {isToday ? "No stories have been shared today yet." : `No ${isPastDate ? 'winner' : 'data'} found for ${format(currentDate, 'MMMM d, yyyy')}.`}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {isToday ? "Be the first to share your story and take the lead!" : "Winners are calculated at midnight based on story reactions."}
            </p>
          </div>
        ) : (
          <>
            <div className={isShowingLeader ? "bg-blue-100 dark:bg-blue-800/30 p-4 rounded-lg" : "bg-yellow-100 dark:bg-yellow-800/30 p-4 rounded-lg"}>
              <h3 className={`text-xl font-bold ${isShowingLeader ? 'text-blue-800 dark:text-blue-200' : 'text-yellow-800 dark:text-yellow-200'} flex items-center mb-2`}>
                {isShowingLeader ? (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-300" />
                    Currently Leading
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-300" />
                    Winning Story
                  </>
                )}
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <h4 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                  {isShowingLeader ? leadingStory.title : winner?.daily_stories?.title}
                </h4>
                {(isShowingLeader ? leadingStory.description : winner?.daily_stories?.description) && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {isShowingLeader ? leadingStory.description : winner?.daily_stories?.description}
                  </p>
                )}
                <Link 
                  to={`/stories?story=${isShowingLeader ? leadingStory.id : winner?.story_id}`} 
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read full story <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={isShowingLeader ? leadingStory.profiles?.avatar_url : winner?.profiles?.avatar_url} />
                <AvatarFallback className="text-2xl bg-yellow-100 text-yellow-800">
                  {(isShowingLeader ? leadingStory.profiles?.display_name : winner?.profiles?.display_name)?.charAt(0)?.toUpperCase() || 'W'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isShowingLeader ? leadingStory.profiles?.display_name : winner?.profiles?.display_name || 'Anonymous'}
                </h3>
                <Badge className={isShowingLeader ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}>
                  {isShowingLeader ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Current Leader
                    </>
                  ) : (
                    <>
                      <Trophy className="w-3 h-3 mr-1" />
                      Story Champion
                    </>
                  )}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {isShowingLeader 
                    ? (leadingStory.reactions.heart * 3) + (leadingStory.reactions.shock * 2) - leadingStory.reactions['thumbs-down']
                    : winner?.total_score
                  }
                </div>
                <div className="text-sm text-gray-500">{isShowingLeader ? 'Current Score' : 'Final Score'}</div>
              </div>
              
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="flex items-center justify-center text-red-500 mb-1">
                    <Heart className="w-4 h-4 mr-1" />
                    {isShowingLeader ? leadingStory.reactions.heart : winner?.heart_count}
                  </div>
                  <div className="text-xs text-gray-500">Hearts</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-yellow-500 mb-1">
                    <Zap className="w-4 h-4 mr-1" />
                    {isShowingLeader ? leadingStory.reactions.shock : winner?.shock_count}
                  </div>
                  <div className="text-xs text-gray-500">Shock</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center text-gray-500 mb-1">
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    {isShowingLeader ? leadingStory.reactions['thumbs-down'] : winner?.thumbs_down_count}
                  </div>
                  <div className="text-xs text-gray-500">Thumbs Down</div>
                </div>
              </div>
            </div>

            {isShowingLeader ? (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200 text-center font-medium">
                  📈 This story is currently leading! The final winner will be determined at midnight.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-200 text-center font-medium">
                  🎉 Congratulations! Writer earned 1000 author points! 🎉
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
