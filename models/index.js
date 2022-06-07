const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config')[env];
const User = require('./user');
const Media = require('./media');

const db = {};
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;
db.User = User;
db.Media = Media;

User.init(sequelize);
Media.init(sequelize);

User.associate(db);
Media.associate(db);

module.exports = db;