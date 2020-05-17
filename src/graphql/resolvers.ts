import { ProductSearch } from '../services/ProductSearch';
import { ProductListResponse, QuerySearchProductsArgs, Resolvers } from './types';
import { Types } from '../configs/container';

export const resolvers: Resolvers = {
  Query: {
    searchProducts: async (root, args: QuerySearchProductsArgs, context): Promise<ProductListResponse> => {
      console.debug('resolving searchProducts with args: ', args);
      const productSearch: ProductSearch = context.container.get(Types.ProductSearch);

      return productSearch.search({
        afterCursor: args.afterCursor,
        query: args.text,
        limit: args.limit,
        brands: args.brands,
        colors: args.colors,
        categories: args.categories,
        priceMax: args.priceMax,
        priceMin: args.priceMin,
        sort: args.sort ? args.sort.map(({ field, asc }) => ({ field: field.toLowerCase(), asc })) as any : []
      });
    },
  },
};
