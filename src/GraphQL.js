import { graphiqlKoa, graphqlKoa } from 'apollo-server-koa';
import { makeExecutableSchema } from 'graphql-tools';

export default class GraphQL {
  constructor(schemaText, endpointURL, db, logging) {
    this.schemaText = schemaText;
    this.logging = logging;
    this.db = db;
    this.graphiql = graphiqlKoa({ endpointURL });
  }

  middleware() {
    return async (context, next) => {
      await graphqlKoa({
        schema: makeExecutableSchema({
          typeDefs: this.schemaText,
          resolvers: {
            Query: this.Query,
          },
        }),
        context,
      })(context, next);
    };
  }

  get Query() {
    const { Sequelize } = this.db;
    return {
      nearEntitiesInPoint: async (obj, {
        point, distance, limit, offset,
      }) => {
        const rows = await this.db.sequelize.models.entities.findAll({
          attributes: [
            'id',
            'name',
            'desc',
            'picture',
            'category_id',
            'geo',
            'geo_text',
            'pref_id',
            'city_id',
            [Sequelize.fn('ST_Length', Sequelize.fn('ST_GeomFromText', Sequelize.fn('CONCAT',
              `LINESTRING(${point.lat} ${point.lng},`,
              Sequelize.fn('ST_X', Sequelize.col('geo')), ' ',
              Sequelize.fn('ST_Y', Sequelize.col('geo')), ')'))), 'distance'],
          ],
          order: [Sequelize.col('distance')],
          limit,
          offset,
          having: {
            distance: {
              [Sequelize.Op.lte]: 0.0089831601679492 * distance,
            },
          },
        });
        return rows.map((v) => {
          const data = v.dataValues;
          data.geo = {
            lat: data.geo.coordinates[0],
            lng: data.geo.coordinates[1],
          };
          return data;
        });
      },
      nearEntities: async (obj, {
        entityId, distance, limit, offset,
      }) => {
        // TODO: raw query to sequelize findAll
        const rows = await this.db.sequelize
          .query(`SELECT ST_Length(ST_GeomFromText(CONCAT('LINESTRING(', ST_X(e1.geo), ' ', ST_Y(e1.geo), ',', ST_X(e2.geo), ' ', ST_Y(e2.geo), ')'))) AS distance, 
          e2.id, e2.name, e2.\`desc\`, e2.picture, e2.category_id, e2.geo, e2.geo_text, e2.pref_id, e2.city_id
          FROM entities AS e1 INNER JOIN entities AS e2
          WHERE e1.id = ${entityId} AND e1.id != e2.id
          GROUP BY e2.id HAVING distance <= ${0.0089831601679492 * distance} 
          ORDER BY distance LIMIT ${offset}, ${limit};`, { type: Sequelize.QueryTypes.SELECT });
        return rows.map((v) => {
          const data = v;
          data.geo = {
            lat: data.geo.coordinates[0],
            lng: data.geo.coordinates[1],
          };
          return data;
        });
      },
    };
  }
}
