const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { PORT } = require("./config");
const postgres = require("./modules/postgres");


async function server(){
    try{
        const app = express();
        app.listen(PORT, () => console.log("SERVER READY..."))

        app.use(express.json());
        app.use(express.urlencoded({extended: true}));
        app.use(cors());

        app.use(async (req, res, next) => {
            const psql = postgres();
            req.psql = psql;
            next();
        })

        fs.readdir(path.join(__dirname, "routes"), (err, files) => {
            if(!err){
                files.forEach(file => {
                    const routePath = path.join(__dirname, "routes", file);
                    const Route = require(routePath);

                    if(Route.path && Route.router) app.use(Route.path, Route.router);


                })
            }
        })

    }catch(e){
        console.log(e)
    }
}

server();