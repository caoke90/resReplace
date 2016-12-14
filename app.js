var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, parameterLimit: 1000000,limit:"1000000kb" }));

app.use(cookieParser("secret"));

app.listen(3000);

//获取文件夹内所有文件路径

Api=require("./Api")
var fs=require("fs")
app.use(function(req,res,next){
    if(fs.existsSync(req.path.substr(1)+".ejs")){
        console.log(req.path)
        Api.render(__dirname+req.path+".ejs",req,function(content){
            res.send(content)
        })
    }else{
        next()
    }
})


//静态文件
app.use(express.static(__dirname));
