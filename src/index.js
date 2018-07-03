/* eslint-disable no-console */
import path from 'path';
import fs from 'fs';

import Koa from 'koa';
import koaCors from '@koa/cors';
import koaBody from 'koa-bodyparser';
import Router from 'koa-router';
import Serve from 'koa-static';

import GraphQL from './GraphQL';
import db from '../db/models/index';

db.sequelize.sync().then(() => {
  const schemaText = fs.readFileSync(path.join(__dirname, '..', 'schema.graphql'), 'utf-8');
  const graphQL = new GraphQL(schemaText, '/api', db, console.log);

  const app = new Koa();
  app.use(koaCors());
  app.use(koaBody());

  const router = new Router();

  router.post('/api', graphQL.middleware());
  router.get('/api', graphQL.middleware());
  router.get('/api/graphiql', graphQL.graphiql);

  app.use(router.routes()).use(router.allowedMethods());

  app.use(Serve(path.join(__dirname, '..', 'static')));

  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`listen http://localhost:${port}`);
  });
});
