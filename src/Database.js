/* created by Shogo Yoshida 2018.12.20 */
import sequelize from 'sequelize';
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: './Tourismap.db',
});

const Place = sequelize.define('place', {
  yahooId: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
  yahooCategoryId: {
    type: Sequelize.DataTypes.STRING,
    allowNull: false,
  },
});

const PlaceMap = sequelize.define('placeMap', {
  url: {
    type: Sequelize.DataTypes.STRING,
  },
});

Place.hasOne(PlaceMap);
