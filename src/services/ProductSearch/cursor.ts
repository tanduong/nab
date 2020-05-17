import { ProductDocument } from '../../common/ProductDocument';
import { SortOptions } from './index';

export function buildCursor(doc: ProductDocument, sort: SortOptions[]): string {
  const filteredDoc = [...(sort && sort.length > 0 ? sort.map((x) => x.field) : []), 'id'].reduce((agg, k) => {
    agg[k] = doc[k];
    return agg;
  }, {});
  let data = JSON.stringify(filteredDoc);
  let buff = new Buffer(data);
  return buff.toString('base64');
}

export function parseCursor(cursor: string): {
  id: string;
  price?: number;
} {
  let buff = new Buffer(cursor, 'base64');
  let text = buff.toString('ascii'); // utf-8?
  return JSON.parse(text);
}
