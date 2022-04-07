const { Sequelize } = require("sequelize");
const { DB_URL } = require("../config");
const AttemptModel = require("../models/AttemptModel");
const SessionModel = require("../models/SessionModel");
const UserModel = require("../models/UserModel");

const sequelize = new Sequelize(DB_URL,{
    logging: (e) => console.log("SQL: " + e)
});    

module.exports = async function(){
    try{
        const db = {};

        db.users = await UserModel(Sequelize, sequelize);
        db.sessions = await SessionModel(Sequelize, sequelize);
        db.attempts = await AttemptModel(Sequelize, sequelize);

        //references

        db.users.hasMany(db.sessions, {
            foreignKey: {
                name: "user_id",
                allowNull: false
            }
        });

        db.sessions.belongsTo(db.users, {
            foreignKey: {
                name: "user_id",
                allowNull: false
            }
        });

        db.users.hasMany(db.attempts, {
            foreignKey: {
                name: "user_id",
                allowNull: false,
            }
        });

        db.attempts.belongsTo(db.users, {
            foreignKey:{
                name: "user_id",
                allowNull: false,
            }
        })

        sequelize.sync({alter: false});

        return db;
    }catch(e){
        console.log("post"+e)
    }
}