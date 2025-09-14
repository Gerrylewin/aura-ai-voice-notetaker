
export const getSampleAnalyticsData = () => ({
  overview: {
    totalViews: 2840,
    uniqueVisitors: 1650,
    downloads: 245,
    totalReadingTime: 1250, // hours
    averageReadingTime: 35, // minutes per session
    completionRate: 68, // percentage
    shares: 89,
    clicks: 156,
    revenue: 2205.50
  },
  dailyStats: [
    { date: '2024-05-25', views: 45, downloads: 8, readingTime: 120 },
    { date: '2024-05-26', views: 52, downloads: 12, readingTime: 145 },
    { date: '2024-05-27', views: 38, downloads: 6, readingTime: 98 },
    { date: '2024-05-28', views: 61, downloads: 15, readingTime: 167 },
    { date: '2024-05-29', views: 44, downloads: 9, readingTime: 134 },
    { date: '2024-05-30', views: 58, downloads: 13, readingTime: 152 },
    { date: '2024-06-01', views: 67, downloads: 18, readingTime: 189 }
  ],
  demographics: [
    { name: 'Mobile', value: 65, color: '#ef4444' },
    { name: 'Desktop', value: 28, color: '#3b82f6' },
    { name: 'Tablet', value: 7, color: '#10b981' }
  ],
  topPages: [
    { page: 'Chapter 1: Introduction', views: 340, avgTime: '4:23' },
    { page: 'Chapter 3: Core Concepts', views: 285, avgTime: '6:12' },
    { page: 'Chapter 5: Advanced Topics', views: 198, avgTime: '8:45' },
    { page: 'Chapter 2: Getting Started', views: 156, avgTime: '3:56' }
  ]
});
