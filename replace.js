var fs=require("fs")

var Wind=require("wind")
Wind.logger.level = Wind.Logging.Level.WARN;

var glob = require("glob")

//地址不变的内容替换
var replace=eval(Wind.compile("async", function (regStr,params1,params2) {
    if(Object.prototype.toString.call(params1)!="[object Array]"){
        params1=[params1]
        params2=[params2]
    }
    for(var k=0;k<params1.length;k++) {
        var p1 = params1[k];
        //字符转正则
        if (typeof p1 == "string") {
            p1 = p1.replace(/[\(\)\[\]\\\*\^\:\.\+\/]/g, function (m) {
                return "\\" + m;
            })
            p1 = new RegExp(p1, "g")
        }
        params1[k]=p1;
    }
    var files=glob.sync(regStr,{nodir:true})

    var hasChange=[]
    for(var i=0;i<files.length;i++){
        var filepath=files[i];
        var buff=fs.readFileSync(filepath)
        var content=buff.toString();
        var ncontent=content;
        for(var k=0;k<params1.length;k++){
            var p1=params1[k];
            var p2=params2[k];
            var _super=function(content,filepath){
                return content.replace(p1,function(){
                    if(typeof p2=="function"){
                        return p2.apply({
                            filepath:filepath,
                            _super:_super
                        },arguments)
                    }else{
                        return p2;
                    }
                });
            }
            ncontent=_super(ncontent,filepath)
        }
        if(ncontent!=content){
            hasChange.push(filepath)
            fs.writeFileSync(filepath,ncontent);
        }
    }
    return hasChange
}))
module.exports=replace;
//console.log(replace("test/*","sdfsdf","abcdef").start())