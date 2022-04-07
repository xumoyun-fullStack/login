const { generateHash, compareHash } = require("../modules/bcrytpt");
const { generateToken } = require("../modules/jwt");
const moment = require("moment");


module.exports = class UserController{

    static async SignUPPOST(req, res){
       
        try{
            const { name, email, password } = req.body;

            let psql = await req.psql;
            let user = await psql.users.findOne({
                where: {
                    email,
                },
                raw: true
            });

            
            if(user) throw new Error("This email already in use");
            

            const pass = await generateHash(password);

            user = await psql.users.create({
                name,
                email,
                password: pass
            },{
                raw: true,
            });


            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const useragent = req.headers['user-agent'];

            const session = await psql.sessions.create({
                user_id: user.id,
                useragent,
                ip,
            })

            let token = generateToken({
                session_id: session.id,
            });

            res.status(201).json({
                ok: true,
                data: {
                    token,
                    user,
                    session    
                }
            })



        }catch(e){
            res.status(400).json({
                ok: false,
                message: e + ""
            });
            console.log(e)
        }
    }

    static async LoginPOST(req, res){
         try{
             const { email, password } = req.body;

             let psql = await req.psql;

             let user = await psql.users.findOne({
                 where: {
                     email,
                 },
                 raw: true,
             });

             if(!user) throw new Error("User is not registered");

             let isTrue = await compareHash(password, user.password);
             
             let attempt = await psql.attempts.findOne({
                 where: {
                     user_id: user.id,
                 },
                 raw: true,
             });

             if(!attempt){
                 await psql.attempts.create({
                     user_id: user.id,
                     attempt: 1,
                 })
             }else{

                if(attempt.expire){
                    if(attempt.expire < new Date().getTime()){
                        await psql.attempts.update({
                            expire: null,
                            attempt: 0,
                        },{
                            where:{
                                id: attempt.id,
                            }
                        })
                    }else {
                        throw new Error(`Wait until ${moment(attempt.expire).locale("uz").format("LLL")}`);
                    }
                     
                }
                if(attempt.attempt >= 2){
                    if(!isTrue){
                        let expire = new Date().getTime() + 1000 * 60 * 1;

                    await psql.attempts.update({
                        attempt: 3,
                        expire: expire,
                    },{
                        where: {
                            id: attempt.id,
                        }
                    })

                    throw new Error(`Incorrect password, try after ${moment(expire).locale("en-US").format("LLL")}`);
                    }

                }

              
                
                await psql.attempts.update({
                    attempt: attempt.attempt + 1,
                },{
                    where: {
                        id: attempt.id,
                    }
                })
             }


             if(!isTrue) throw new Error("Incorrect password");
             
             await psql.attempts.destroy({
                 where: {
                     user_id: user.id,
                 }
             });

            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

            const useragent = req.headers['user-agent'];

            const session = await psql.sessions.create({
                user_id: user.id,
                useragent,
                ip,
            })

            let token = generateToken({
                session_id: session.id,
            });

            res.status(200).json({
                ok: true,
                data:{
                    user,
                    session,
                    token
                }
            });

         }catch(e){
             res.status(400).json({
                 ok: false,
                 message: e + ""
             })
             console.log(e)
         }
    }
}