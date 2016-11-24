var fs=require("fs")

var Wind=require("wind")
Wind.logger.level = Wind.Logging.Level.WARN;

var glob = require("glob")
var path = require("path")
function mkdir(filepath){
    var path=require("path")
    if(!fs.existsSync(path.dirname(filepath))){
        mkdir(path.dirname(filepath))
    }
    if(!fs.existsSync(filepath)){
        fs.mkdirSync(filepath)
    }
}

//地址不变的内容替换
var copy=eval(Wind.compile("async", function (regStr,reg1,reg2) {

    var files=glob.sync(regStr,{nodir:true})

    for(var i=0;i<files.length;i++){
        var file=files[i];

        var npath=file.replace(reg1,reg2);
        mkdir(path.dirname(npath));
        fs.writeFileSync(npath,fs.readFileSync(file));
    }

}))
module.exports=copy;