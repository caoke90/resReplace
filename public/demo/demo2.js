var glob=require("glob")
var Wind=require("Wind")

var Demo=Api.BigClass.extend({
    velocity:1,
    getData:eval(Wind.compile("async", function (req,next) {
        var content=$await(Api.getContent("http://oil.cngold.com.cn/20161130d1816n103335895.html"))
        var info=Api.getInfo(content)
        next(info)
    })),
    getCache:eval(Wind.compile("async", function (req,next) {
        next("212222212")
    }))
})
module.exports=new Demo()