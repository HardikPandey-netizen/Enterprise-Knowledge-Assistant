const dotenv = require('dotenv');
const mongoose = require('mongoose');


process.on('uncaughtException',err=>{
    console.log(err.name,err.message);
    console.log("Uncaught exception shutting.....");
    process.exit(1);

});


const app = require('./app');

dotenv.config({ path: "./config.env"});

const DB = process.env.DATABASE.replace(
    "<db_password>",
    process.env.DATABASE_PASSWORD
);   

mongoose.connect(DB).then((con)=>{
    console.log("DB Connection sucessfull")
})

const port = process.env.PORT || 4444;
const server = app.listen(port,()=>{
    console.log(`App running on Port ${port}`);
})

process.on('unhandledRejection',err=>{
    console.log(err.name,err.message);
    console.log("Unhandle rejection shutting.....");
    server.close(()=>{
        process.exit(1);
    })
});

