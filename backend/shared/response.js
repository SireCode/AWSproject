const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Content-Type': 'application/json',
};

function build(statusCode, body) {
  return { statusCode, headers: CORS, body: JSON.stringify(body) };
}

module.exports = {
  ok: (body) => build(200, body),
  created: (body) => build(201, body),
  badRequest: (msg) => build(400, { error: msg }),
  unauthorized: () => build(401, { error: 'Unauthorized' }),
  forbidden: () => build(403, { error: 'Forbidden' }),
  notFound: (msg = 'Not found') => build(404, { error: msg }),
  serverError: (err) => {
    console.error(err);
    return build(500, { error: 'Internal server error' });
  },
};
