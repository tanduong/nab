import { ApolloServer } from 'apollo-server';
import { resolvers } from './resolvers';
import { schema } from './schema';
import initializer from '../configs/initializer';
import container from '../configs/container';
import { interfaces } from 'inversify';

export interface Context {
  container: interfaces.Container
}

const context: Context = {
  container: initializer(container)
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});