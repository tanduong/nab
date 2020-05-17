import { searchProduct } from "../../search/ProductSearch";
import { Client } from "@elastic/elasticsearch";

describe('searchProduct', () => {
  let esClient: Client;

  beforeAll(() => {
    esClient = new Client({ node: 'http://localhost:9200' })
  });

  test('search', async () => {
    const results = await searchProduct(esClient, {
      query: 'fis',
      limit: 2,
      sort: []
    });

    console.log('results', results);
    expect(results.length).toBeGreaterThan(0);
    const foundItemNames = results.map(i => i.name);

    const fishItemNames = [
      'Refined Steel Fish',
      'Gorgeous Concrete Fish',
      'Intelligent Wooden Fish',
      'Handcrafted Fresh Fish',
      'Refined Plastic Fish'
    ];

    expect(foundItemNames).toEqual(fishItemNames);
  });

});