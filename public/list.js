var glob=require("glob")
var Wind=require("Wind")
var fs=require("fs")
var Api=require("../Api")
module.exports={
    render:eval(Wind.compile("async", function (req,next) {

        if(fs.existsSync("tidData.txt")){
            var taskData=JSON.parse(fs.readFileSync("tidData.txt").toString())
        }
        next(taskData)
    }))
}