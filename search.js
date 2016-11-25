var fs=require("fs")
var Iconv = require('iconv-lite');
var Wind=require("wind")
var request = require('request');
var getContent=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {
    if(/^https?:\/\//.test(pathOrUrl)){
        request.get(pathOrUrl, function (error, response, body) {

            if(!error) {
                if (/gb(2312|k)/i.test(response.headers['content-type'])) {
                    body = Iconv.decode(body, 'gb2312').toString()
                } else {
                    body = body.toString()
                }
                callback(body)
            }else{
                callback("")
            }
        })
    }else{
        var buf=fs.readFileSync(pathOrUrl)
        callback(buf.toString());
    }

})
//字符转正则
function regDir(reg){
    if(typeof reg=="string"){
        reg=reg.replace(/[\[\]\\\^\:\.\?\+\/]/g,function(m){
            return "\\"+m;
        })
        reg=reg.replace(/\*\*|\*/g,function(m){
            if(m=="**"){
                return "[\\w\\W]*";
            }else{
                return "[^\\\/]*";
            }

        })
        reg=new RegExp(reg,"gi")
    }
    return reg
}

//地址不变的内容替换
var search=eval(Wind.compile("async", function (pathOrUrl,params) {
    var content=$await(getContent(pathOrUrl));
    var hasChange=[]

    for(var i=0;i<params.length;i++){
       var reg=regDir(params[i]);
        var itemArr=[]
        content.replace(reg,function(m){
            var arr=[]
            if(arguments.length>2){
                for(var j=1;j<arguments.length-2;j++){
                    arr.push(arguments[j])
                }
            }else{
                arr.push(m);
            }
            if(arr.length>1){
                itemArr.push(arr)
            }else{
                itemArr.push(arr[0])
            }
        })
        if(itemArr.length>1){
            hasChange.push(itemArr)
        }else{
            hasChange.push(itemArr[0])
        }
    }

    return hasChange
}))
module.exports=search;