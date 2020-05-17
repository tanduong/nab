import { searchProduct } from '../search/ProductSearch';
import { QuerySearchProductsArgs, ProductListResponse, Resolvers } from './types';

export const resolvers: Resolvers = {
  Query: {
    searchProducts: async (root, args: QuerySearchProductsArgs, context): Promise<ProductListResponse> => {
      console.debug('resolving searchProducts with args: ', args);
      return await searchProduct(context.esClient, {
        query: args.text,
        limit: args.limit,
        brands: args.brands,
        colors: args.colors,
        categories: args.categories,
        priceMax: args.priceMax,
        priceMin: args.priceMin,
      });
    },
  },
};
