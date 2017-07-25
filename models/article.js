module.exports = function (sequelize, DataTypes) {
  return sequelize.define('article', {
    title: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    author: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT('tiny'),
      allowNull: false
    }
  });
}