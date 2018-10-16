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

  static hubenyDistance(lat1, lng1, lat2, lng2) {
    const radLat1 = lat1 * Math.PI / 180;
    const radLat2 = lat2 * Math.PI / 180;
    const latAvg = (radLat1 + radLat2) / 2.0;
    const sinLat = Math.sin(latAvg);
    const W2 = 1.0 - 0.00669438002301188 * (sinLat * sinLat);
    const t1 = 6335439.32708317 / (Math.sqrt(W2) * W2) * (radLat1 - radLat2);
    const t2 = 6378137.0 / Math.sqrt(W2) * Math.cos(latAvg)
      * ((lng1 * Math.PI / 180) - (lng2 * Math.PI / 180));
    return Math.sqrt((t1 * t1) + (t2 * t2));
  }

  static filterNearest(centerPoint, limit, ...items) {
    const list = items.map(v => ({
      ...v,
      distance: this.hubenyDistance(centerPoint.lat, centerPoint.lng, v.geo.lat, v.geo.lng),
    }));
    list.sort((a, b) => a.distance - b.distance);
    return list.slice(0, limit);
  }

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
        return this.filterNearest(point, limit, ...manhole, ...yahooLocal);
      },
      searchEntities: async (obj, {
        name, limit, offset,
      }) => {
        // const manhole = await ManholeMapAPI.searchEntities(name, limit, offset);
        const yahooLocal = await YahooLocalSearchAPI
          .searchEntities(name, limit, offset);
        return [/* ...manhole, */...yahooLocal];
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
