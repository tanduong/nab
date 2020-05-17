import * as fs from 'fs';
import * as path from 'path';
import { Client } from '@elastic/elasticsearch';
import { ProductIndexer } from '../services/ProductIndexer';
import { IndexConfig } from '../configs/IndexConfig';

async function main() {
  const client = new Client({ node: 'http://localhost:9200' });

  const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf8'));
  const productIndexer = new ProductIndexer(client, IndexConfig);
  await productIndexer.indexProducts(data).catch(console.error);
}

main().then(console.log).catch(console.error);