var glob=require("glob")
var Wind=require("Wind")
var Api=require("../Api")

var fs=require("fs")
Api.startAnt=eval(Wind.compile("async", function (startTask) {

    //获取一个列表html，解析添加list、item，重复这个过程
    //获取url
    var taskData={
        curIndex:0,
        taskList:["http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2"]
    }
    if(fs.existsSync("taskData.txt")){
        taskData=JSON.parse(fs.readFileSync("taskData.txt").toString())
        startTask.forEach(function(url){
            var index=taskData.taskList.indexOf(url)
            if(index==-1){
                taskData.taskList.push(url)
            }else{
                if(taskData.curIndex==taskData.taskList.length){
                    taskData.taskList.splice(index,1)
                    taskData.taskList.push(url)
                    taskData.curIndex--
                }
            }
        })
    }
    //提取了那些url
    var dataList=[]
    if(fs.existsSync("data.txt")){
        dataList=JSON.parse(fs.readFileSync("data.txt").toString())
    }
    var ok=true
    while(ok&&taskData.taskList.length>taskData.curIndex){
        var cururl=taskData.taskList[taskData.curIndex++]
        console.log(cururl)
        //获取html
        var html=$await(Api.getContent(cururl))
        var tempList=Api.search(html,["forum.php?mod=forumdisplay&fid=*&amp;page=*&amp;mobile=2"])
        var isRefresh=false
        //添加新的任务
        tempList.forEach(function(item){
            var url="http://www.168ytt.com/"+item.replace(/&amp;/g,"&")
            if(taskData.taskList.indexOf(url)==-1){
                isRefresh=true
                taskData.taskList.push(url)
            }
        })

        //采集信息
        var tempItem=Api.search(html,[/tid=(\d+)/g])
        //forum.php?mod=viewthread&amp;tid=35641&amp;extra=page%3D237&amp;mobile=2
        tempItem.forEach(function(item){
            var url=item
            if(dataList.indexOf(url)==-1){
                console.log(url)
                isRefresh=true
                dataList.push(url)
            }
        })
        if(isRefresh){
            //采集到的数据
            fs.writeFileSync("data.txt",JSON.stringify(dataList))

            //执行中的任务
            fs.writeFileSync("taskData.txt",JSON.stringify(taskData))
        }else{
            //异常页面
            ok=false
        }
    }
    console.log("startAnt over")
}))

Api.startAnt(["http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2"]).start()