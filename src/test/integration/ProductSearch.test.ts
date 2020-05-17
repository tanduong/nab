import { searchProduct } from "../../search/ProductSearch";
import { Client } from "@elastic/elasticsearch";

describe('searchProduct', () => {
  let esClient: Client;

  beforeAll(() => {
    esClient = new Client({ node: 'http://localhost:9200' })
  });

  test('search by text', async () => {
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

  test('search by text with filter', async () => {
    const results = await searchProduct(esClient, {
      query: 'fis',
      limit: 2,
      colors: ['indigo'],
      sort: []
    });

    console.log('results', results);
    expect(results.length).toBeGreaterThan(0);
    const foundItemNames = results.map(i => i.name);

    const fishItemNames = [
      'Refined Plastic Fish'
    ];

    expect(foundItemNames).toEqual(fishItemNames);
  });

});