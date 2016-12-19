var glob=require("glob")
var Wind=require("Wind")
var Api=require("../Api")
module.exports={
    render:eval(Wind.compile("async", function (req,next) {
        var list=$await(Api.localstore.keysAsync("*"))
        next(list)
    }))
}