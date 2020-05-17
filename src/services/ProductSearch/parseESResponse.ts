import { ProductDocument } from '../../common/ProductDocument';
import { buildCursor } from './cursor';
export function parseESResponse(results, sort): {
  pageInfo?: {
    cursor: string;
  };
  data: ProductDocument[];
} {
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
  }
  catch (e) {
    console.error('error', e);
    return { data: [] };
  }
}
