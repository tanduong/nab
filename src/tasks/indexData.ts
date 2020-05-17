import * as fs from 'fs';
import * as path from 'path';
import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';
import { bulkIndex, deleteIndex, createIndex } from '../services/ProductIndexer';
import { IndexConfig } from '../common/IndexConfig';

async function main() {
  const client = new Client({ node: 'http://localhost:9200' });
  await deleteIndex(client, IndexConfig);
  await createIndex(client, IndexConfig);

  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf8'));
  await bulkIndex(client, data, IndexConfig).catch(console.log);
}

main();