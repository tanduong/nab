import { searchProduct } from '../../services/ProductSearch';
import { Client } from '@elastic/elasticsearch';
import { buildCursor, parseCursor } from '../../services/ProductSearch/cursor';

describe('searchProduct', () => {
  let esClient: Client;

  beforeAll(() => {
    esClient = new Client({ node: 'http://localhost:9200' });
  });

  test('search by text', async () => {
    const results = await searchProduct(esClient, {
      query: 'fis',
      limit: 2,
      sort: [
        { field: 'price', asc: true }
      ],
    });

    expect(results.data.length).toBeGreaterThan(0);
    const foundItemNames = results.data.map((i) => i.name);

    const fishItemNames = ['Handcrafted Fresh Fish', 'Gorgeous Concrete Fish'];

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

  test('search with sort and pagination', async () => {
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

    const fishItemNames = ['Licensed Wooden Pants', 'Refined Plastic Fish'];

    expect(foundItemNames).toEqual(fishItemNames);
  });
});

describe('cursor', () => {
  test.each([
    [{ id: 'DFM63Pnrmz', price: 2000 }, [{ field: 'price', asc: true }]],
    [{ id: 'DFM63Pnrmz' } as any, [] as any],
  ])('build and Parse', (a: any, b: any) => {
    const cursor = buildCursor(a, b);
    const parsed = parseCursor(cursor);
    expect(parsed).toEqual(a);
  });
});
