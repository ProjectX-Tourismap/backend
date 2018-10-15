import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';
import ManholeMapAPI from './ManholeMapAPI';
import YahooLocalSearchAPI from './YahooLocalSearchAPI';

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

  // TODO: limit * 2ある. 距離順に並べて削ること.
  static get Query() {
    return {
      entity: async (obj, { categoryId, id }) => {
        if (Number(categoryId) === 0) return ManholeMapAPI.entity(id);
        return YahooLocalSearchAPI.entity(categoryId, id);
      },
      nearEntitiesInPoint: async (obj, {
        point, distance, limit, offset,
      }) => {
        const manhole = await ManholeMapAPI.nearEntitiesInPoint(point, distance, limit, offset);
        const yahooLocal = await YahooLocalSearchAPI
          .nearEntitiesInPoint(point, distance, limit, offset);
        return [...manhole, ...yahooLocal];
      },
      searchEntities: async (obj, {
        name, limit, offset,
      }) => {
        const manhole = await ManholeMapAPI.searchEntities(name, limit, offset);
        const yahooLocal = await YahooLocalSearchAPI.searchEntities(name, limit, offset);
        return [...manhole, ...yahooLocal];
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
      categories: (obj, { limit, offset }) => ['Manhole'].map((name, id) => ({
        id,
        name,
      })).slice(offset, offset + limit),
    };
  }
}
