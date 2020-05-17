import "reflect-metadata";
import { inject, injectable } from 'inversify';
import { ApiResponse, Client } from '@elastic/elasticsearch';
import { ProductDocument } from '../../common/ProductDocument';
import { IndexConfig } from '../../configs/IndexConfig';
import { buildESQuery } from './buildESQuery';
import { transformResponse } from './transformResponse';
import { Types } from '../../configs/container';

export type SortOptions = {
  field: 'price';
  asc: boolean;
};

export type SearchOptions = {
  query?: string;
  limit: number;
  afterCursor?: string;
  priceMin?: number;
  priceMax?: number;
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sort?: SortOptions[];
};

@injectable()
export class ProductSearch {
  client: Client
  constructor(@inject(Types.elasticsearchProductClient) client: Client) {
    this.client = client;
  }

  search(options: SearchOptions): Promise<{ pageInfo?: { cursor: string }; data: ProductDocument[] }> {
    return new Promise((resolve) => {
      const query = buildESQuery(IndexConfig, options);
      console.debug('Querying with', JSON.stringify(query, null, 2));
      this.client
        .search(query)
        .then((result: ApiResponse) => {
          resolve(transformResponse(result, options.sort));
        })
        .catch((err: Error) => {
          console.error(err);
          throw err;
        });
    });
  }
}
