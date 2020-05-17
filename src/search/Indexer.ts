import { Client, ApiResponse, RequestParams } from '@elastic/elasticsearch';
import * as fs from 'fs';
import * as path from 'path';
const client = new Client({ node: 'http://localhost:9200' });

const IndexConfig = {
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
      },
      color: { type: 'keyword' },
      image: { type: 'keyword' },
      price: { type: 'integer' },
    },
  },
};

async function deleteIndex(indexConfig) {
  return await client.indices.delete({
    index: IndexConfig.name,
  });
}

async function createIndex(indexConfig) {
  const INDEX_EXISTED_ERROR = 400;

  return await client.indices.create(
    {
      index: IndexConfig.name,
      body: {
        mappings: IndexConfig.mappings,
      },
    },
    { ignore: [INDEX_EXISTED_ERROR] },
  );
}

async function runBatch(dataset) {
  await deleteIndex(IndexConfig);
  await createIndex(IndexConfig);

  const body = dataset.flatMap((doc) => [{ index: { _index: IndexConfig.name } }, doc]);

  const { body: bulkResponse } = await client.bulk({ refresh: 'true', body });

  if (bulkResponse.errors) {
    const erroredDocuments = [];
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0];
      if (action[operation].error) {
        erroredDocuments.push({
          status: action[operation].status,
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          couldRetry: action[operation].status == 429,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1],
        });
      }
    });
    console.log(erroredDocuments);
  }

  const { body: count } = await client.count({ index: 'tweets' });
  console.log(count);
}

async function search(text) {
  return new Promise((resolve, reject) => {
    const params: RequestParams.Search = {
      index: 'product',
      body: {
        query: {
          multi_match: {
            query: text,
            type: 'bool_prefix',
            fields: ['name', 'name._2gram', 'name._3gram'],
          },
        },
        sort: { price: 'asc' },
      },
    };

    client
      .search(params)
      .then((result: ApiResponse) => {
        console.log(result.body.hits.hits);
        resolve(result);
      })
      .catch((err: Error) => {
        console.error(err);
        resolve(err);
      });
  });
}


const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/products.json'), 'utf8'));
console.log('data', data);

runBatch(data).catch(console.log);
search('lifestyle')