export const IndexConfig = {
  name: 'product',
  settings: {
    index: {
      analysis: {
        filter: {
          shingle: {
            type: 'shingle',
            min_gram_size: 2,
            max_gram_size: 3,
          },
        },
        analyzer: {
          trigram: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['shingle', 'asciifolding', 'lowercase'],
          },
          reverse: {
            type: 'custom',
            tokenizer: 'standard',
            filter: ['lowercase', 'asciifolding', 'reverse'],
          },
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      brand: { type: 'keyword' },
      category: { type: 'keyword' },
      name: {
        type: 'search_as_you_type',
        analyzer: 'trigram',
        boost: 2,
        fields: {
          reverse: {
            type: 'search_as_you_type',
            analyzer: 'reverse'
          },
          keyword: {
            type: 'keyword',
          },
        },
      },
      color: { type: 'keyword' },
      image: { type: 'keyword' },
      price: { type: 'integer' },
    },
  },
};
