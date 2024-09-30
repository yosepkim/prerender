function generateHashKey(stringInput) {
  const stringData = stringInput.replace(/\s/g, "");
  let hash = 0, i, chr;
  if (stringData.length === 0) return hash;
  for (i = 0; i < stringData.length; i++) {
    chr = stringData.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}


const getAll = async (server, { hdbCore, logger }) => {
  server.route({
    url: '/save',
    method: 'POST',
    handler: async (request) => {

      const insertQuery = {
        body: {
          operation: "upsert",
          schema: "prerender",
          table: "page",
          records: [request.body]
        }
      };

      return await hdbCore.requestWithoutAuthentication(insertQuery);

    }
  });

  server.route({
    url: '/view/*',
    method: 'GET',
    handler: async (request, reply) => {
      try {
        const host = request.query.host;
        const path = request.url.replace('/prerender/view/', '').split('?')[0];
        const url = `https://${host}/${path}`;
        const hashKey = generateHashKey(url);
        const selectQuery = {
          body: {
            operation: 'search_by_id',
            database: 'prerender',
            table: 'page',
            ids: [hashKey],
            get_attributes: ['content']
          }
        };
        const records = await hdbCore.requestWithoutAuthentication(selectQuery);
        if (records.length > 0) {
          reply
            .code(200)
            .type('text/html')
            .send(records[0].content)
        } else {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              ...request.headers,
            }
          });
          const payload = await response.text();
          reply
            .code(200)
            .type('text/html')
            .send(payload)
        }
      } catch (exception) {
        reply
          .code(500)
          .header('Content-Type', 'application/json; charset=utf-8')
          .send({ error: exception });
      }
    }
  });
}
export default getAll;

