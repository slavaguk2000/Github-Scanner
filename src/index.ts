import 'core-js/features/reflect';
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { buildSchema } from 'type-graphql';
import RepoResolver from './resolvers/repo';

const bootstrap = async () => {
  const schema = await buildSchema({
    resolvers: [RepoResolver],
    authChecker: () => true,
  });

  const server = new ApolloServer({ schema });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 5000 },
  });
  console.log(`GraphQL server ready at ${url}`);
};

bootstrap();
