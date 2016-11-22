
var fs=require("fs")
var urlReplace=function(arr1,arr2){
    var replace=function (content,filepath,callback) {

        for(var i=0;i<arr1.length;i++){
            content=content.replace(arr1[i],arr2[i])
        }

        callback(content);
    }
    return replace;
}
module.exports=urlReplace;