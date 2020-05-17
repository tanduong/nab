import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';
import { ProductDocument } from './ProductDocument';

type SortOptions = {
  field: 'price';
  asc: boolean;
};

export type SearchOptions = {
  query?: string;
  limit: number;
  afterCursor?: string;
  priceMin?: number;
  priceMax?: number;
  categoryId?: string;
  branchId?: string;
  color?: string;
  sort?: SortOptions[];
};

export function buildESQuery(options: SearchOptions): RequestParams.Search {
  const query: RequestParams.Search = {
    index: 'product',
    body: {},
  };

  if (options.query) {
    query.body['query'] = {
      multi_match: {
        query: options.query,
        type: 'bool_prefix',
        fields: ['name', 'name._2gram', 'name._3gram'],
      },
    }
  }

  return query;
}

export function parseESResponse(results): ProductDocument[] {
  try {
    return results.body.hits.hits.map((h) => h._source);
  } catch {
    return [];
  }
}

export class ProductSearch {
  client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  async search(options: SearchOptions): Promise<ProductDocument[]> {
    return new Promise((resolve, reject) => {
      this.client
        .search(buildESQuery(options))
        .then((result: ApiResponse) => {
          resolve(parseESResponse(result));
        })
        .catch((err: Error) => {
          console.error(err);
          throw err;
        });
    });
  }
}
