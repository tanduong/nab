import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';
import { ProductDocument } from '../common/ProductDocument';
import { IndexConfig } from '../common/IndexConfig';

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
  categories?: string[];
  brands?: string[];
  colors?: string[];
  sort?: SortOptions[];
};

export function buildCursor(doc: ProductDocument, sort: SortOptions[]): string {
  const filteredDoc = [...(sort && sort.length > 0 ? sort.map((x) => x.field) : []), 'id'].reduce((agg, k) => {
    agg[k] = doc[k];
    return agg;
  }, {});

  let data = JSON.stringify(filteredDoc);
  let buff = new Buffer(data);
  return buff.toString('base64');
}

export function parseCursor(cursor: string): { id: string; price?: number } {
  let buff = new Buffer(cursor, 'base64');
  let text = buff.toString('ascii'); // utf-8?
  return JSON.parse(text);
}

export function buildESQuery(indexConfig, options: SearchOptions): RequestParams.Search {
  const query: RequestParams.Search = {
    index: indexConfig.name,
    body: {
      query: {
        bool: {
          must: [],
        },
      },
    },
  };

  if (options.query) {
    query.body['query'].bool.must.push({
      multi_match: {
        query: options.query,
        type: 'bool_prefix',
        fields: ['name', 'name._2gram', 'name._3gram'],
      },
    });
  }

  if (options.colors && options.colors.length > 0) {
    query.body['query'].bool.must.push({
      terms: {
        color: options.colors,
      },
    });
  }

  if (options.brands && options.brands.length > 0) {
    query.body['query'].bool.must.push({
      terms: {
        brand: options.brands,
      },
    });
  }

  if (options.categories && options.categories.length > 0) {
    query.body['query'].bool.must.push({
      terms: {
        category: options.categories,
      },
    });
  }

  // This short comming need a bit more considerations.
  // The limit param alone could support pagination just fine in the first iteration.
  if (options.afterCursor) {
    const cursor = parseCursor(options.afterCursor);
    query.body['search_after'] = [...(options.sort ? options.sort.map((x) => x.field) : []), 'id'].map(
      (k) => cursor[k],
    );
  }

  query.body['size'] = options.limit;

  if (options.sort && options.sort.length > 0) {
    query.body['sort'] = [...options.sort.map(({ field, asc }) => ({ [field]: asc ? 'asc' : 'desc' })), { id: 'asc' }];
  } else {
    query.body['sort'] = [{ id: 'asc' }];
  }

  return query;
}

export function parseESResponse(results, sort): { pageInfo?: { cursor: string }; data: ProductDocument[] } {
  try {
    const data = results.body.hits.hits.map((h) => h._source) as ProductDocument[];
    console.debug('data', data);
    const lastItem = data[data.length - 1];
    return {
      pageInfo: {
        cursor: buildCursor(lastItem, sort),
      },
      data: data,
    };
  } catch (e) {
    console.error('error', e);
    return { data: [] };
  }
}

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
        resolve(parseESResponse(result, options.sort));
      })
      .catch((err: Error) => {
        console.error(err);
        throw err;
      });
  });
}
