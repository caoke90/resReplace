var fs=require("fs")
var path=require("path")
var inlineReplace=function(){
    var reg=/(.*)__inline\((.+?)\)/g
    var replace=function (content,filepath,callback) {
        var sync=function(content,filepath){
            if(reg.test(content)){
                var dirname=path.dirname(filepath)+"/"
                content=content.replace(reg,function(m,p1,p2){
                    var path1=p2.replace(/["']/g,"");
                    var filepath1=path.join(dirname+path1)
                    var str=fs.readFileSync(filepath1).toString()
                    if(p1){
                        return "'"+sync(str,filepath1).replace(/\s/g,"").replace(/'/g,'\\')+"'";
                    }else{
                        return sync(str,filepath1);
                    }

                })
            }
            return content;
        }
        callback(sync(content,filepath));
    }
    return replace;
};

module.exports=inlineReplace;
