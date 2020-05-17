import { ProductSearch } from "../../search/ProductSearch";
import { Client } from "@elastic/elasticsearch";

describe('ProductSearch', () => {
  let esClient: Client;
  let searchClient: ProductSearch;

  beforeAll(() => {
    esClient = new Client({ node: 'http://localhost:9200' })
    searchClient = new ProductSearch(esClient)
  });

  test('search', async () => {
    const results = await searchClient.search({
      query: 'fis',
      limit: 2,
      sort: []
    });

    console.log('results', results);
    expect(results.length).toBeGreaterThan(0);
  });

});