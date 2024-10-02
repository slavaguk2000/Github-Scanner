import { Octokit } from 'octokit';

interface RepositoryRawData {
  name: string;
  owner: {
    id: number;
    login: string;
    avatar_url?: string;
    url?: string;
  };
  size: number;
}

interface RepositoryData {
  name: string;
  owner: {
    id: number;
    login: string;
    avatarUrl?: string;
    url?: string;
  };
  size: number;
}

class GithubService {
  private octokit: Octokit;

  constructor(personalAccessToken: string) {
    this.octokit = new Octokit({ auth: personalAccessToken });
  }

  public async getRepositories(): Promise<Array<RepositoryData>> {
    let page = 1;
    const maxPerPage = 100;
    const repositories: Array<RepositoryData> = [];

    while (true) {
      try {
        const response = (await this.octokit.request('GET /user/repos', {
          headers: {
            'X-GitHub-Api-Version': '2022-11-28',
          },
          per_page: maxPerPage,
          page,
        })) as { data: Array<RepositoryRawData> };

        repositories.push(
          ...response.data.map(
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
          )
        );

        if (maxPerPage > response.data.length) {
          break;
        }

        page++;
      } catch (e) {
        console.error(e);
        return [];
      }
    }

    return repositories;
  }
}

export default GithubService;
