import { ApiResponse, Client } from '@elastic/elasticsearch';
import { ProductDocument } from '../../common/ProductDocument';
import { IndexConfig } from '../../common/IndexConfig';
import { buildESQuery } from './buildESQuery';
import { transformResponse } from './transformResponse';

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

export async function searchProduct(
  client: Client,
  options: SearchOptions,
): Promise<{ pageInfo?: { cursor: string }; data: ProductDocument[] }> {
  return new Promise((resolve) => {
    const query = buildESQuery(IndexConfig, options);
    console.debug('Querying with', JSON.stringify(query, null, 2));
    client
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
