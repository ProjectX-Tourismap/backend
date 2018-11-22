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

const Detail = sequelize.define("detail", {
  id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  url: {
    type: DataTypes.STRING,
  },
});

