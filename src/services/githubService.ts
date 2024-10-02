import { Octokit } from 'octokit';
import { RepositoryVisibility } from '../types/repositoryTypes';
import { VisibilityDictionary } from '../dictionaries/repositoryDictionaries';

interface RepositoryTreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree' | string;
  sha: string;
  size: number;
  url: string;
}

interface RepositoryTreeFileSummary extends RepositoryTreeNode {
  type: 'blob' | string;
}

interface RepositoryFileData {
  sha: string;
  node_id: string;
  size: number;
  url: string;
  content: string;
  encoding: string;
}

interface RepositoryTreeRawData {
  sha: string;
  url: string;
  tree: Array<RepositoryTreeNode>;
  truncated: boolean;
}

interface RepositoryIdentification {
  name: string;
  owner: string;
}

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

interface RepositoryDetailedRawData extends RepositoryRawData {
  visibility: string;
  default_branch: string;
}

interface RepositoryDetailedData extends RepositoryData {
  visibility: RepositoryVisibility;
  filesNumber: number;
  ymlContent?: string;
  // activeWebhooks: string;
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

  private async requestWithAllowedErrors<T>(
    path: string,
    variables: Record<string, string | Record<string, string>>,
    allowedErrors: Array<number>
  ): Promise<T> {
    try {
      const response = (await this.octokit.request(path, variables)) as {
        data: T;
      };

      return response.data;
    } catch (error) {
      console.error(error);

      const { response } = error as {
        response?: { data?: { status?: string; message?: string } };
      };

      if (
        (allowedErrors as Array<number | undefined>).includes(
          Number(response?.data?.status)
        ) &&
        response?.data?.message
      ) {
        throw new Error(response.data.message);
      }

      throw new Error('Internal Error');
    }
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
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
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
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
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
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
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

  public async getRepositoryDetails(
    repoId: RepositoryIdentification
  ): Promise<RepositoryDetailedData> {
    const { name, size, owner, visibility, default_branch } =
      await this.getRepository(repoId);

    const files = await this.getFiles(repoId, default_branch);

    const firstYmlFile = files.find(({ path }) => path.endsWith('.yml'));

    const ymlContent = firstYmlFile && await this.getTextFileContent(repoId, firstYmlFile.sha);

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
    };
  }
}

export default GithubService;
