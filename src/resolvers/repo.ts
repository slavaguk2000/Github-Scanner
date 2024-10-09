import {
  Arg,
  Field,
  ID,
  Int,
  ObjectType,
  Query,
  registerEnumType,
  Resolver,
} from 'type-graphql';
import GithubService from '../services/githubService';
import { RepositoryVisibility } from '../enums/repositoryEnums';
import { TaskQueue } from '../services/TaskQueue';

registerEnumType(RepositoryVisibility, {
  name: 'RepositoryVisibility',
  description: 'The visibility of repository (private or public)',
});

@ObjectType()
class RepoOwner {
  @Field(() => ID)
  id?: number;

  @Field(() => String)
  login?: string;

  @Field(() => String, { nullable: true })
  avatar_url?: string;

  @Field(() => String)
  url?: string;
}

@ObjectType()
class RepoSummary {
  @Field(() => String)
  name?: string;

  @Field(() => Int)
  size?: number;

  @Field(() => RepoOwner)
  owner?: RepoOwner;
}

@ObjectType()
class Webhook {
  @Field(() => ID)
  id?: number;

  @Field(() => String)
  name?: string;

  @Field(() => Boolean)
  active?: boolean;

  @Field(() => Date)
  updatedAt?: string;

  @Field(() => Date)
  createdAt?: string;

  @Field(() => String)
  url?: string;

  @Field(() => String)
  testUrl?: string;

  @Field(() => String)
  pingUrl?: string;

  @Field(() => String)
  deliveriesUrl?: string;
}

@ObjectType()
class RepoDetails extends RepoSummary {
  @Field(() => RepositoryVisibility)
  visibility?: RepositoryVisibility;

  @Field(() => Int)
  filesNumber?: number;

  @Field(() => String, { nullable: true })
  ymlContent?: string;

  @Field(() => [Webhook])
  activeWebhooks?: Webhook[];
}

@Resolver()
class RepoResolver {
  /**
   * Fetches a list of repositories for the authenticated GitHub user.
   *
   * @param {string} personalAccessToken - The user's personal access token for GitHub API authentication.
   * @returns {Promise<Array<RepoSummary>>} - An array of repository summaries.
   */
  @Query(() => [RepoSummary])
  async repositories(
    @Arg('personalAccessToken', () => String) personalAccessToken: string
  ): Promise<Array<RepoSummary>> {
    return new GithubService(personalAccessToken).getRepositories();
  }

  /**
   * Fetches detailed information for a specific repository.
   *
   * @param {string} personalAccessToken - The user's personal access token for GitHub API authentication.
   * @param {string} repoOwner - The owner of the repository.
   * @param {string} repoName - The name of the repository.
   * @returns {Promise<RepoDetails>} - Detailed information about the repository.
   */
  @Query(() => RepoDetails)
  async repoDetails(
    @Arg('personalAccessToken', () => String) personalAccessToken: string,
    @Arg('repositoryOwner', () => String) repoOwner: string,
    @Arg('repositoryName', () => String) repoName: string
  ): Promise<RepoDetails> {
    return TaskQueue.getInstance().execute(() =>
      new GithubService(personalAccessToken).getRepositoryDetails({
        owner: repoOwner,
        name: repoName,
      })
    );
  }
}

export default RepoResolver;
