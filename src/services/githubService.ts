import { Octokit } from 'octokit';
import { VisibilityDictionary } from '../dictionaries/repositoryDictionaries';
import {
  RepositoryData,
  RepositoryDetailedData,
  RepositoryDetailedRawData,
  RepositoryFileData,
  RepositoryIdentification,
  RepositoryRawWebhook,
  RepositoryTreeFileSummary,
  RepositoryTreeRawData,
  RepositoryWebhook,
} from './types';
import { GITHUB_API_VERSION } from '../constants';
import { getErrorMessage } from '../utils/errorProcessing';

class GithubService {
  private octokit: Octokit;
  private githubApiVersion: string;

  constructor(personalAccessToken: string) {
    this.octokit = new Octokit({ auth: personalAccessToken });
    this.githubApiVersion = GITHUB_API_VERSION;
  }

  /**
   * Retrieves a list of all repositories for the authenticated GitHub user.
   *
   * @returns {Promise<Array<RepositoryData>>} - A list of repositories with basic details.
   */
  public async getRepositories(): Promise<Array<RepositoryData>> {
    const repositories =
      await this.getPaginatedData<RepositoryDetailedRawData>('GET /user/repos');

    return repositories.map(
      ({ name, size, owner: { id, login, avatar_url, url } }) => ({
        name,
        size,
        owner: {
          id,
          login,
          avatarUrl: avatar_url,
          url,
        },
      })
    );
  }

  public async getWebhooks({
    owner,
    name,
  }: RepositoryIdentification): Promise<Array<RepositoryWebhook>> {
    const webhooks = await this.getPaginatedData<RepositoryRawWebhook>(
      'GET /repos/{owner}/{repo}/hooks',
      [404],
      {
        owner,
        repo: name,
      }
    );

    return webhooks.map(
      ({
        id,
        name,
        active,
        created_at,
        updated_at,
        url,
        test_url,
        ping_url,
        deliveries_url,
      }) => ({
        id,
        name,
        active,
        updatedAt: created_at,
        createdAt: updated_at,
        url,
        testUrl: test_url,
        pingUrl: ping_url,
        deliveriesUrl: deliveries_url,
      })
    );
  }

  /**
   * Retrieves details about a specific repository, including files and webhooks.
   *
   * @param {RepositoryIdentification} repoId - Object containing repository owner and name.
   * @returns {Promise<RepositoryDetailedData>} - Detailed repository data.
   */
  public async getRepositoryDetails(
    repoId: RepositoryIdentification
  ): Promise<RepositoryDetailedData> {
    const { name, size, owner, visibility, default_branch } =
      await this.getRepository(repoId);

    const files = await this.getFiles(repoId, default_branch);

    const firstYmlFile = files.find(({ path }) => path.endsWith('.yml'));

    const ymlContent =
      firstYmlFile && (await this.getTextFileContent(repoId, firstYmlFile.sha));

    const webhooks = await this.getWebhooks(repoId);

    const activeWebhooks = webhooks.filter(({ active }) => active);

    return {
      name,
      owner: {
        id: owner.id,
        login: owner.login,
        url: owner.url,
        avatarUrl: owner.avatar_url,
      },
      size,
      visibility: VisibilityDictionary.getByRawString(visibility),
      filesNumber: files.length,
      ymlContent,
      activeWebhooks,
    };
  }

  /**
   * Makes an API request and handles allowed error statuses by returning a custom error message.
   *
   * @param {string} path - GitHub API endpoint.
   * @param {Record<string, unknown>} variables - Request variables.
   * @param {Array<number>} allowedStatuses - Allowed error HTTP status codes.
   * @returns {Promise<T>} - The response data from the API.
   */
  private async requestWithAllowedErrors<T>(
    path: string,
    variables: Record<string, number | string | Record<string, string>>,
    allowedStatuses: Array<number>
  ): Promise<T> {
    try {
      const response = (await this.octokit.request(path, {
        ...variables,
        headers: { 'X-GitHub-Api-Version': this.githubApiVersion },
      })) as {
        data: T;
      };

      return response.data;
    } catch (error) {
      console.error(error);

      throw new Error(getErrorMessage(error, allowedStatuses));
    }
  }

  private async getPaginatedData<T>(
    path: string,
    allowedErrors: Array<number> = [],
    additionalParams: Record<string, string> = {}
  ): Promise<Array<T>> {
    let page = 1;
    const maxPerPage = 100;
    const items: Array<T> = [];

    while (true) {
      try {
        const data = await this.requestWithAllowedErrors<Array<T>>(
          path,
          {
            per_page: maxPerPage,
            page,
            ...additionalParams,
          },
          allowedErrors
        );

        items.push(...data);

        if (maxPerPage > data.length) {
          break;
        }

        page++;
      } catch (e) {
        console.error(e);
        return [];
      }
    }

    return items;
  }

  private async getRepository({
    owner,
    name,
  }: RepositoryIdentification): Promise<RepositoryDetailedRawData> {
    return this.requestWithAllowedErrors<RepositoryDetailedRawData>(
      'GET /repos/{owner}/{repo}',
      {
        owner,
        repo: name,
      },
      [301, 403, 404]
    );
  }

  private getRepositoryTree(
    { owner, name }: RepositoryIdentification,
    branchName: string
  ): Promise<RepositoryTreeRawData> {
    return this.requestWithAllowedErrors<RepositoryTreeRawData>(
      'GET /repos/{owner}/{repo}/git/trees/{tree_sha}',
      {
        owner,
        repo: name,
        tree_sha: branchName,
        recursive: 'recursive',
      },
      [404, 409, 422]
    );
  }

  private async getFiles(
    repoId: RepositoryIdentification,
    branch: string
  ): Promise<Array<RepositoryTreeFileSummary>> {
    const data = await this.getRepositoryTree(repoId, branch);

    if (data.truncated) {
      throw new Error(
        "We don't support so large repository now. If you need supporting them, contact to us"
      );
    }

    return data.tree.filter(({ type }) => type !== 'tree');
  }

  private getFileData(
    { owner, name }: RepositoryIdentification,
    fileSha: string
  ): Promise<RepositoryFileData> {
    return this.requestWithAllowedErrors<RepositoryFileData>(
      'GET /repos/{owner}/{repo}/git/blobs/{file_sha}',
      {
        owner,
        repo: name,
        file_sha: fileSha,
      },
      [404, 409, 422]
    );
  }

  private async getTextFileContent(
    repoId: RepositoryIdentification,
    fileSha: string
  ) {
    const fileData = await this.getFileData(repoId, fileSha);

    return (
      fileData &&
      Buffer.from(
        fileData.content,
        fileData.encoding as BufferEncoding
      ).toString('utf-8')
    );
  }
}

export default GithubService;
