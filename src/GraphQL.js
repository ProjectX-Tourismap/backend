import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import ManholeMapAPI from './ManholeMapAPI';
import Database from './Database';

export default class GraphQL {
  constructor(schemaText, endpointURL) {
    this.schemaText = schemaText;
    this.graphiql = graphiqlKoa({ endpointURL });
  }

  middleware() {
    return async (context, next) => {
      await graphqlKoa({
        schema: makeExecutableSchema({
          typeDefs: this.schemaText,
          resolvers: {
            Query: GraphQL.Query,
          },
        }),
        context,
      })(context, next);
    };
  }

  static get Query() {
    /* eslint-disable no-param-reassign */
    return {
      entity: async (obj, { categoryId, id }) => {
        if (categoryId === Database.categories.indexOf('Manhole')) return ManholeMapAPI.entity(id);
        return null;
      },
      nearEntitiesInPoint: async (obj, {
        point, distance, limit, offset,
      }) => {
        const manhole = await ManholeMapAPI.nearEntitiesInPoint(point, distance, limit, offset);
        return manhole;
      },
      searchEntities: async (obj, {
        name, limit, offset,
      }) => {
        const manhole = await ManholeMapAPI.searchEntities(name, limit, offset);
        return manhole;
      },
      nearEntities: async (obj, {
        categoryId, id, distance, limit, offset,
      }) => {
        const entity = await GraphQL.Query.entity({}, { categoryId, id });
        if (!entity) return [];
        return GraphQL.Query.nearEntitiesInPoint({}, {
          point: entity.geo, distance, limit, offset,
        });
      },
      categories: (obj, { limit, offset }) => Database.categories
        .map((name, id) => ({ id, name })).slice(offset, offset + limit),
    };
  }
}
