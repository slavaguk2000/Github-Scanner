import { RepositoryVisibility } from '../enums/repositoryEnums';

export class VisibilityDictionary {
  private static mapping: { [key: string]: RepositoryVisibility } = {
    public: RepositoryVisibility.Public,
    private: RepositoryVisibility.Private,
  };

  /**
   * Converts a raw string input to a RepositoryVisibility enum value.
   *
   * It's crucial to validate and transform any incoming data from the network
   * before trusting it in the code. Network data is inherently untrusted,
   * meaning it could be manipulated, malformed, or malicious. Relying on this
   * data directly can lead to potential security vulnerabilities, application crashes,
   * or unexpected behaviors. By checking the type and sanitizing the data,
   * we ensure that only valid, expected values are used, which enhances the
   * reliability and security of the application.
   *
   * @param rawString - The raw string input representing visibility.
   * @returns {RepositoryVisibility} - A corresponding enum value or RepositoryVisibility.Unknown for unrecognized inputs.
   */
  public static getByRawString(rawString: string): RepositoryVisibility {
    return this.mapping[rawString] || RepositoryVisibility.Unknown;
  }
}
