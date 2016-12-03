var fs=require("fs")
var Wind=require("wind")
var getContent=require("./getContent")
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
var search=function (content,params) {
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
    if(params.length==1){
        return hasChange[0];
    }
    return hasChange
}
module.exports=search;