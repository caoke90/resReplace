var glob=require("glob")
var Wind=require("Wind")
var fs=require("fs")
var Api=require("../Api")

module.exports={
    render:eval(Wind.compile("async", function (req,next) {
        if(!fs.existsSync("list.html")){
            var taskData=JSON.parse(fs.readFileSync("tidData.txt").toString())
            var listData=[]
            for(var i=0;i<taskData.curIndex;i++){
                var tid=taskData.taskList[i]
                var html=$await(Api.localstore.getAsync(tid))
                if(!/\d{4}-\d{1,2}-\d{1,2} \d+:\d+:\d+/g.exec(html)){
                    console.log(html)
                }
                var json={
                    tid:tid,
                    time:/(\d{4}-\d{1,2}-\d{1,2}) \d+:\d+:\d+/g.exec(html)[1],
                    title:/<title>([\d\D]+?)<\/title>/g.exec(html)[1].replace(/&#9654;[\d\D]+?Powered by Discuz!/,"")
                }
                listData.push(json)
            }
            listData=listData.sort(function(item1,item2){
                var p1=new Date(item1.time).getTime()
                var p2=new Date(item2.time).getTime()
                return p1>p2?-1:1
            })
            next(listData)
        }
//        if(fs.existsSync("tidData.txt")){
//            var taskData=JSON.parse(fs.readFileSync("tidData.txt").toString())
//        }
//        next(listData)
    }))
}
