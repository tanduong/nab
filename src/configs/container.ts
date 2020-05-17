import { Container } from 'inversify';
const container = new Container();
export const Types = {
  elasticsearchProductClient: Symbol('shared/elasticsearchProductClient'),
  IndexConfig: Symbol('shared/IndexConfig'),
  ProductSearch: Symbol('services/ProductSearch'),
  ProductIndexer: Symbol('services/ProductIndexer'),
};

export default container;