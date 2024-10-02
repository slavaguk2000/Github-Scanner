import { Field, Int, ObjectType, Query, Resolver } from 'type-graphql';

@ObjectType()
class RepoSummary {
  @Field(() => String)
  name?: string;

  @Field(() => Int)
  size?: number;

  @Field(() => String)
  owner?: string;
}

@Resolver()
class RepoResolver {
  @Query(() => [RepoSummary])
  async repositories() {
    return [];
  }
}

export default RepoResolver;
