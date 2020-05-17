import { Client } from '@elastic/elasticsearch';
import { deleteIndex, createIndex, bulkIndex } from './utils';

export async function indexProducts(client: Client, data, indexConfig) {
  await deleteIndex(client, indexConfig);
  await createIndex(client, indexConfig);
  return bulkIndex(client, data, indexConfig);
}