var fs=require("fs")

var Wind=require("wind")
Wind.logger.level = Wind.Logging.Level.WARN;

var glob = require("glob")

//地址不变的内容替换
var res=eval(Wind.compile("async", function (regStr,replaceBack) {
    var replace=Wind.Async.Binding.fromCallback(replaceBack)
    var files=glob.sync(regStr,{nodir:true})
    console.log(files)
    for(var i=0;i<files.length;i++){
        var filepath=files[i];
        var buff=fs.readFileSync(filepath)
        var content=buff.toString();

        var ncontent=$await(replace(content,filepath));
        if(ncontent!=content){
            console.log(filepath,"改变")
            fs.writeFileSync(filepath,ncontent);
        }
    }
}))
module.exports=res;