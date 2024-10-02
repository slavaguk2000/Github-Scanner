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
import { RepositoryVisibility } from '../types/repositoryTypes';

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
class RepoDetails extends RepoSummary {
  @Field(() => RepositoryVisibility)
  visibility?: RepositoryVisibility;

  @Field(() => Int)
  filesNumber?: number;

  @Field(() => String, { nullable: true })
  ymlContent?: string;

  @Field(() => String, { nullable: true })
  activeWebhooks?: string;
}

@Resolver()
class RepoResolver {
  @Query(() => [RepoSummary])
  async repositories(
    @Arg('personalAccessToken', () => String) personalAccessToken: string
  ): Promise<Array<RepoSummary>> {
    return new GithubService(personalAccessToken).getRepositories();
  }

  @Query(() => RepoDetails)
  async repoDetails(
    @Arg('personalAccessToken', () => String) personalAccessToken: string,
    @Arg('repositoryOwner', () => String) repoOwner: string,
    @Arg('repositoryName', () => String) repoName: string
  ): Promise<RepoDetails> {
    return await new GithubService(personalAccessToken).getRepositoryDetails({
      owner: repoOwner,
      name: repoName,
    });
  }
}

export default RepoResolver;
