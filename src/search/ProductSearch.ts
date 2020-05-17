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


export function buildCursor(id: string, price: number): string {
  let data = `${id}||${price}`;
  let buff = new Buffer(data);
  return buff.toString('base64');
}

export function parseCursor(cursor: string): { id: string; price?: number } {
  let buff = new Buffer(cursor, 'base64');
  let text = buff.toString('ascii');
  const [id, price] = text.split('||');
  console.log('id, price', id, price);

  if (price) {
    return { id, price: parseInt(price) };
  }

  return { id };
}

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

  // This short commings need a bit more considerations.
  // The limit param alone can support pagination just fine in the first iteration.
  // if (options.afterCursor) {
  //   const { id, price } = parseCursor(options.afterCursor);
  // }

  query.body['size'] = options.limit;

  if (options.sort && options.sort.length > 0) {
    query.body['sort'] = [...options.sort.map(({ field, asc }) => ({ [field]: asc ? 'asc' : 'desc' })), { id: 'asc' }]
  }

  return query;
}

export function parseESResponse(results): { pageInfo?: { cursor: string }, data: ProductDocument[] } {
  try {
    const data = results.body.hits.hits.map((h) => h._source) as ProductDocument[];
    const lastItem = data[data.length - 1];
    return {
      pageInfo: {
        cursor: buildCursor(lastItem.id, lastItem.price)
      },
      data: data
    }
  } catch (e) {
    console.error('error', e);
    return { data: [] };
  }
}

export async function searchProduct(client: Client, options: SearchOptions): Promise<{ pageInfo?: { cursor: string }, data: ProductDocument[] }> {
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

