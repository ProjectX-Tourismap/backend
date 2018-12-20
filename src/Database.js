const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: './Tourismap.db',
});

const Place = sequelize.define("place", {
  yahooId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  yahooCategoryId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const PlaceMap = sequelize.define("placeMap", {
  url: {
    type: DataTypes.STRING,
  },
});

Place.hasOne(PlaceMap);

