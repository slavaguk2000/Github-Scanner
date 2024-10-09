import { RepositoryVisibility } from '../enums/repositoryEnums';

export class VisibilityDictionary {
  public static getByRawString(rawString: string): RepositoryVisibility {
    switch (rawString) {
      case 'public':
        return RepositoryVisibility.Public;
      case 'private':
        return RepositoryVisibility.Private;
      default:
        return RepositoryVisibility.Unknown;
    }
  }
}
