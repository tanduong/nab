import { searchProduct, buildCursor, parseCursor } from '../../search/ProductSearch';
import { Client } from '@elastic/elasticsearch';

describe('searchProduct', () => {
  let esClient: Client;

  beforeAll(() => {
    esClient = new Client({ node: 'http://localhost:9200' });
  });

  test('search by text', async () => {
    const results = await searchProduct(esClient, {
      query: 'fis',
      limit: 2,
      sort: [],
    });

    console.log('results', results);
    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Refined Steel Fish', 'Gorgeous Concrete Fish'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test('search by text with color filter', async () => {
    const results = await searchProduct(esClient, {
      query: 'fis',
      limit: 2,
      colors: ['indigo'],
      sort: [],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Refined Plastic Fish'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test('search with color filter', async () => {
    const results = await searchProduct(esClient, {
      limit: 2,
      colors: ['indigo'],
      sort: [
        {
          field: 'price',
          asc: true,
        },
      ],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Rustic Metal Chicken', 'Intelligent Plastic Chicken'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test('search with brand filter', async () => {
    const results = await searchProduct(esClient, {
      limit: 2,
      brands: ['vZViMywOSe'],
      sort: [{ field: 'price', asc: true }],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Licensed Fresh Mouse', 'Unbranded Wooden Computer'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test('search with category filter', async () => {
    const results = await searchProduct(esClient, {
      limit: 2,
      categories: ['home-and-lifestyle'],
      sort: [{ field: 'price', asc: true }],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Licensed Fresh Mouse', 'Sleek Cotton Table'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test('search with sort', async () => {
    const results = await searchProduct(esClient, {
      limit: 2,
      colors: ['indigo'],
      sort: [
        {
          field: 'price',
          asc: true,
        },
      ],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Rustic Metal Chicken', 'Intelligent Plastic Chicken'];

    expect(foundItemNames).toEqual(fishItemNames);
  });

  test.skip('search with sort and pagination', async () => {
    const results = await searchProduct(esClient, {
      limit: 2,
      colors: ['indigo'],
      sort: [
        {
          field: 'price',
          asc: true,
        },
      ],
    });

    const cursor = results.pageInfo.cursor;

    const resultsNextpage = await searchProduct(esClient, {
      limit: 2,
      colors: ['indigo'],
      afterCursor: cursor,
      sort: [
        {
          field: 'price',
          asc: true,
        },
      ],
    });

    expect(resultsNextpage.data.length).toBeGreaterThan(0);
    const foundItemNames = resultsNextpage.data.map((i) => i.name);

    const fishItemNames = ['Licensed Fresh Mouse', 'Sleek Cotton Table'];

    expect(foundItemNames).toEqual(fishItemNames);
  });
});

describe('cursor', () => {
  test.each([
    ['DFM63Pnrmz', 2000],
    ['5J_aYxQ9yjm', undefined],
  ])('build and Parse (%s, %i)', (a, b) => {
    const cursor = buildCursor(a, b);
    const { id, price } = parseCursor(cursor);
    expect(id).toEqual(a);
    if (b) {
      expect(price).toEqual(b);
    }
  });
});
