import { RequestParams } from '@elastic/elasticsearch';
import { parseCursor } from './cursor';
import { SearchOptions } from './index';
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
  if (options.afterCursor) {
    const cursor = parseCursor(options.afterCursor);
    query.body['search_after'] = [...(options.sort ? options.sort.map((x) => x.field) : []), 'id'].map((k) => cursor[k]);
  }
  query.body['size'] = options.limit;
  if (options.sort && options.sort.length > 0) {
    query.body['sort'] = [...options.sort.map(({ field, asc }) => ({ [field]: asc ? 'asc' : 'desc' })), { id: 'asc' }];
  }
  else {
    query.body['sort'] = [{ id: 'asc' }];
  }
  return query;
}
