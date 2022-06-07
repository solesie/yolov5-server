/**
 * MySQL posts table : sequelize Post model
 * 게시글을 저장하는 게시글 테이블
 */
const Sequelize = require('sequelize');
module.exports = class Media extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            media:{
                type: Sequelize.STRING(300),
                allowNull: false,
            },
        },{
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Media',
            tableName:'medias',
            paranoid: false,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
        });
    }
    static associate(db){
        db.Media.belongsTo(db.User);
    }
}