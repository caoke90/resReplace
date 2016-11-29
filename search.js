var fs=require("fs")
var Iconv = require('iconv-lite');
var Wind=require("wind")
var urllib = require('urllib');
var getContent=Wind.Async.Binding.fromCallback(function(pathOrUrl,callback) {
    if(/^https?:\/\//.test(pathOrUrl)){
        urllib.request(pathOrUrl, function (error,data,response) {
            if(!error) {
                var body=data.toString();
                if (/gb(2312|k)/i.test(response.headers['content-type'])||/<meta .*?charset=(["']?)gb(2312|k|18030)\1?/gi.test(body)||/encoding="gbk"/gi.test(body)) {
                    body = Iconv.decode(data, 'gb2312').toString()
                }
                callback(body)
            }else{

                console.error(error)
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
            for(var k=0;k<arguments.length-2;k++){
                arr.push(arguments[k])
            }
            if(arr.length>1){
                arr.shift()
            }
            if(arr.length==1){
                itemArr=itemArr.concat(arr)
            }else{
                itemArr.push(arr)
            }
        })
        hasChange.push(itemArr)
    }

    return hasChange
}))
module.exports=search;