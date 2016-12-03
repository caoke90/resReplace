var fs=require("fs")

var Wind=require("wind")
Wind.logger.level = Wind.Logging.Level.WARN;

var glob = require("glob")
function strToTeg(p1){
    //字符转正则
    if (typeof p1 == "string") {
        p1 = p1.replace(/[\(\)\[\]\\\*\^\:\.\+\/]/g, function (m) {
            return "\\" + m;
        })
        p1 = new RegExp(p1, "g")
    }
    return p1;
}
//地址不变的内容替换
var replace=eval(Wind.compile("async", function (regStr,modeArr) {
    if(Object.prototype.toString.call(modeArr[0])!="[object Array]"){
        modeArr=[modeArr]
    }
    for(var i=0;i<modeArr.length;i++) {
        modeArr[i][0]=strToTeg(modeArr[i][0]);
    }
    var files=glob.sync(regStr,{nodir:true})

    var hasChange=[]
    for(var i=0;i<files.length;i++){
        var filepath=files[i];
        var buff=fs.readFileSync(filepath)
        var content=buff.toString();
        var ncontent=content;
        for(var k=0;k<modeArr.length;k++){
            var p1=modeArr[k][0];
            var p2=modeArr[k][1];
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