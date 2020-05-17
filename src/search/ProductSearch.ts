import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';
import { ProductDocument } from './ProductDocument';
import { IndexConfig } from './IndexConfig';

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
  colors?: string[];
  sort?: SortOptions[];
};

export function buildESQuery(indexConfig, options: SearchOptions): RequestParams.Search {
  const query: RequestParams.Search = {
    index: indexConfig.name,
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

  if (options.query && options.colors) {
    query.body['query'] = {
      bool: {
        must: [
          {
            multi_match: {
              query: options.query,
              type: 'bool_prefix',
              fields: ['name', 'name._2gram', 'name._3gram'],
            },
          },
          {
            terms: {
              color: options.colors
            }
          }
        ]
      }
    }
  }

  query.body['size'] = options.limit;

  if (options.sort && options.sort.length > 0) {
    query.body['sort'] = options.sort.map(({ field, asc }) => ({ [field]: asc ? 'asc' : 'desc' }))
  }

  return query;
}

export function parseESResponse(results): ProductDocument[] {
  try {
    return results.body.hits.hits.map((h) => h._source);
  } catch (e) {
    console.error('error', e);
    return [];
  }
}


export async function searchProduct(client: Client, options: SearchOptions): Promise<ProductDocument[]> {
  return new Promise((resolve) => {
    const query = buildESQuery(IndexConfig, options)
    console.debug('Querying with', JSON.stringify(query, null, 2))
    client
      .search(query)
      .then((result: ApiResponse) => {
        resolve(parseESResponse(result));
      })
      .catch((err: Error) => {
        console.error(err);
        throw err;
      });
  });
}

