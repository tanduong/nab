import "reflect-metadata";
import { Client } from '@elastic/elasticsearch';
import { inject, injectable } from 'inversify';
import { deleteIndex, createIndex, bulkIndex } from './utils';
import { Types } from '../../configs/container';

@injectable()
export class ProductIndexer {
  client: Client;
  indexConfig: any;

  constructor(@inject(Types.elasticsearchProductClient) client, @inject(Types.IndexConfig) indexConfig) {
    this.client = client;
    this.indexConfig = indexConfig;
  }

  async indexProducts(data) {
    await deleteIndex(this.client, this.indexConfig);
    await createIndex(this.client, this.indexConfig);
    return bulkIndex(this.client, data, this.indexConfig);
  }
}