
import { AuthorLevelInfo } from '@/types/author';

export const AUTHOR_LEVELS: AuthorLevelInfo[] = [
  { level: 1, title: 'Aspiring Writer', pointsRequired: 0, benefits: ['Basic writing tools'] },
  { level: 2, title: 'Novice Author', pointsRequired: 100, benefits: ['Enhanced editor', 'Basic analytics'] },
  { level: 3, title: 'Published Writer', pointsRequired: 500, benefits: ['Advanced formatting', 'Reader insights'] },
  { level: 4, title: 'Established Author', pointsRequired: 1500, benefits: ['Priority support', 'Featured placement'] },
  { level: 5, title: 'Bestselling Author', pointsRequired: 5000, benefits: ['Premium features', 'Author spotlight'] },
  { level: 6, title: 'Master Writer', pointsRequired: 15000, benefits: ['Exclusive tools', 'Mentorship opportunities'] },
  { level: 7, title: 'Literary Legend', pointsRequired: 50000, benefits: ['All features', 'Legacy status'] }
];
