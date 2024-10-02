import { Arg, Field, ID, Int, ObjectType, Query, Resolver } from 'type-graphql';
import GithubService from '../services/githubService';

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

@Resolver()
class RepoResolver {
  @Query(() => [RepoSummary])
  async repositories(@Arg("personalAccessToken", () => String) personalAccessToken: string) {
    return new GithubService(personalAccessToken).getRepositories();
  }
}

export default RepoResolver;
