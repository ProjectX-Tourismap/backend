class Database {
  static get categories() {
    return ['Manhole'];
  }
/*
  constructor() {
    this.sequelize = new Sequelize('sqlite:db.sqlite3');
    this.models = {
      categories: this.sequelize.define('categories', {
        name: {
          type: Sequelize.DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      }),
    };
  }

  initModels() {
    /!* eslint-disable no-underscore-dangle *!/
    return Object.keys(this.models).reduce((prev, next) => prev.then(this.models[next].sync()),
      this.sequelize.authenticate())
      .then(this._initCategories);
  }

  _initCategories() {
    return Database.categories.reduce(
      (prev, name) => prev.then(this.models.categories.create({ name })), Promise.resolve(),
    );
  }
*/
}

export default Database;
