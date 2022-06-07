/**
 * MySQL users table = sequelize User model
 * 사용자를 저장하는 사용자 테이블
 */
const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model{ 
    static init(sequelize){
        return super.init({
            email: {
                type: Sequelize.STRING(40),
                allowNull: true, //NULL: 빈값 허용
                unique: true, //중복되면 안된다.
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100),
                allowNull: true,
            },
            provider: { //로컬 로그인(기본값), 카카오 로그인을 구분
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: 'local',
            },
            snsId: { //카카오 로그인의 경우
                type: Sequelize.STRING(30),
                allowNull: true,
            },
        }, {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'User',
            tableName: 'users',
            paranoid: true,
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }

    static associate(db){
        db.User.hasMany(db.Media);
    }
}