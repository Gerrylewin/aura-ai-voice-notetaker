
import { AuthorLevelInfo, AuthorProgress } from '@/types/author';
import { AUTHOR_LEVELS } from '@/constants/authorLevels';

export class AuthorLevelUtils {
  static getCurrentLevel(authorProgress: AuthorProgress | null): AuthorLevelInfo {
    if (!authorProgress) return AUTHOR_LEVELS[0];
    
    for (let i = AUTHOR_LEVELS.length - 1; i >= 0; i--) {
      if (authorProgress.author_points >= AUTHOR_LEVELS[i].pointsRequired) {
        return AUTHOR_LEVELS[i];
      }
    }
    return AUTHOR_LEVELS[0];
  }

  static getNextLevel(authorProgress: AuthorProgress | null): AuthorLevelInfo | null {
    const currentLevel = this.getCurrentLevel(authorProgress);
    const nextLevelIndex = AUTHOR_LEVELS.findIndex(l => l.level === currentLevel.level) + 1;
    return nextLevelIndex < AUTHOR_LEVELS.length ? AUTHOR_LEVELS[nextLevelIndex] : null;
  }
}
