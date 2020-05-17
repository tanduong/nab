import { Client } from '@elastic/elasticsearch';

export async function deleteIndex(client: Client, indexConfig) {
  return client.indices.delete({
    index: indexConfig.name,
  });
}

export async function createIndex(client: Client, indexConfig) {
  const INDEX_EXISTED_ERROR = 400;

  return client.indices.create(
    {
      index: indexConfig.name,
      body: {
        mappings: indexConfig.mappings,
        settings: indexConfig.settings,
      },
    },
    { ignore: [INDEX_EXISTED_ERROR] },
  );
}

export async function bulkIndex(client: Client, dataset, indexConfig) {
  const body = dataset.flatMap((doc) => [{ index: { _index: indexConfig.name } }, doc]);

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
    console.error(erroredDocuments);
  } else {
    console.log('data indexed!')
  }
}
