import { ContainerModule, interfaces } from 'inversify';

import Bind = interfaces.Bind;
import { Client } from '@elastic/elasticsearch';
import { ProductSearch } from '../services/ProductSearch';
import { Types } from './container';
import { ProductIndexer } from '../services/ProductIndexer';
import { IndexConfig } from './IndexConfig';

const services = new ContainerModule((bind: Bind) => {
  bind<Client>(Types.elasticsearchProductClient).toConstantValue(
    new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' }),
  );
  bind(Types.IndexConfig).toConstantValue(IndexConfig);
  bind<ProductSearch>(Types.ProductSearch).to(ProductSearch);
  bind<ProductIndexer>(Types.ProductIndexer).to(ProductIndexer);
});

const initializer = (container: interfaces.Container) => {
  container.load(services);
  return container;
};

export default initializer;
