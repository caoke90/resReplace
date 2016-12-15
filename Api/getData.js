
var fs=require("fs")
var path=require("path")


function getData(filepath,req,callback) {
    var sp=require(filepath)
    return sp.getData.call(sp,req,callback)
}
module.exports=getData;