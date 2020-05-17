import { ApolloServer } from 'apollo-server';
import { resolvers } from "./resolvers";
import { schema } from "./schema";
import { Client } from '@elastic/elasticsearch';

export interface Context {
  esClient: Client
}

const context: Context = {
  esClient: new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' })
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  context
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});