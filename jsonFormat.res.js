
var jsonFormat=function(){

    var replace=eval(Wind.compile("async", function (content,filepath,callback) {

        try{
            var obj=JSON.parse(content)
            content=JSON.stringify(obj,null,2)
        }catch(e){}
        callback(content);
    }))
    return replace;
};

module.exports=jsonFormat;
