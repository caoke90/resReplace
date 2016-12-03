
var fs=require("fs")
var path=require("path")
function mkdir(filepath){
    if(!fs.existsSync(path.dirname(filepath))){
        mkdir(path.dirname(filepath))
    }
    if(!fs.existsSync(filepath)){
        fs.mkdirSync(filepath)
    }
}
module.exports=mkdir;