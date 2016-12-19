var glob=require("glob")
var Wind=require("Wind")
var Api=require("../Api")
module.exports={
    render:eval(Wind.compile("async", function (req,next) {
        var tid=req.query.tid
        var content=$await(Api.localstore.getAsync(tid))
        content=content.replace(/href="forum.php/g,'href="http://www.168ytt.com/forum.php')
        content=content.replace(/src="forum.php/g,'src="http://www.168ytt.com/forum.php')
        next(content)
    }))
}