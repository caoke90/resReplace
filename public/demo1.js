var glob=require("glob")
var Wind=require("Wind")
var Api=require("../Api")

var fs=require("fs")
Api.startAnt=eval(Wind.compile("async", function (startTask,isneedFresh) {

    //获取一个列表html，解析添加list、item，重复这个过程
    //获取url
    var taskData={
        curIndex:0,
        taskList:startTask
    }
    if(fs.existsSync("pageData.txt")){
        taskData=JSON.parse(fs.readFileSync("pageData.txt").toString())
    }
    //原来的任务已经完成了，添加新的人物
    if(isneedFresh){
        startTask.forEach(function(url){
            var index=taskData.taskList.indexOf(url)
            if(index==-1){
                taskData.taskList.push(url)
            }else{
                taskData.taskList.splice(index,1)
                taskData.taskList.push(url)
                taskData.curIndex--

            }
        })
        //执行中的任务
        fs.writeFileSync("pageData.txt",JSON.stringify(taskData))
    }
    //提取了那些url
    var dataData={
        curIndex:0,
        taskList:[]
    }
    if(fs.existsSync("tidData.txt")){
        dataData=JSON.parse(fs.readFileSync("tidData.txt").toString())
    }
    var ok=true
    while(ok&&taskData.taskList.length>taskData.curIndex){
        var cururl=taskData.taskList[taskData.curIndex++]
        console.log(cururl)
        //获取html
        var html=$await(Api.getContent(cururl))
        if(!/<div class="threadlist">/g.test(html)){
            console.log(html)
            ok=false
            break;
        }
        var tempList=Api.search(html,["forum.php?mod=forumdisplay&fid=*&amp;page=*&amp;mobile=2"])
        var refresh=false
        //添加新的任务
        tempList.forEach(function(item){
            var url="http://www.168ytt.com/"+item.replace(/&amp;/g,"&")
            if(taskData.taskList.indexOf(url)==-1){
                refresh=true
                taskData.taskList.push(url)
            }
        })

        //采集信息
        var tempItem=Api.search(html,[/tid=(\d+)/g])
        //forum.php?mod=viewthread&amp;tid=35641&amp;extra=page%3D237&amp;mobile=2
        tempItem.forEach(function(item){
            var url=item
            if(dataData.taskList.indexOf(url)==-1){
                console.log(url)
                refresh=true
                dataData.taskList.push(url)
            }
        })
        if(refresh){
            //采集到的数据
            fs.writeFileSync("tidData.txt",JSON.stringify(dataData))

            //执行中的任务
            fs.writeFileSync("pageData.txt",JSON.stringify(taskData))
        }else{
            //异常页面
            console.log("没有更新了")
        }
    }
    console.log("startAnt over")
}))

var getAllhtml=eval(Wind.compile("async", function (startTask,isneedFresh) {

    //提取了那些url
    var taskData={
        curIndex:0,
        taskList:[]
    }
    if(fs.existsSync("tidData.txt")){
        taskData=JSON.parse(fs.readFileSync("tidData.txt").toString())
//        taskData.curIndex=0
    }

    var ok=true
    while(ok&&taskData.taskList.length>taskData.curIndex){
        var tid=taskData.taskList[taskData.curIndex++]
        console.log(tid)
        var cururl="http://www.168ytt.com/forum.php?mod=viewthread&tid="+tid+"&extra=page%3D237&mobile=2"
        //获取html
        var html=$await(Api.localstore.getAsync(tid))

        if(!html||/<html><body>/.test(html)){
            html=$await(Api.getContent(cururl))
            if(/<title>每日签到/g.test(html)){
                var arr=Api.search(html,[/action="(plugin.php.+?)"/,/name="formhash" value="(.+?)"/])
                var data={
                    url:"http://www.168ytt.com/"+arr[0][0].replace(/amp;/g,"")+"&handlekey=fastpost&loc=1&inajax=1",
                    form:{
                        formhash:arr[1][0],
                        qdmode:"3",
                        qdxq:"kx"
                    }
                }
                var xml=$await(Api.postGbk(data))
                console.log(xml)
                html=$await(Api.getContent(cururl))
            }
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
        }

        ok=false;


        if(/\$\('#fastpostsubmit'\)/g.test(html)){
            ok=true
            //是否需要回复
            if(/如果您要查看本帖隐藏内容请/g.test(html)){

                var arr=Api.search(html,[/action="(forum.php.+?)"/,/name="formhash" value="(.+?)"/])
                var data={
                    url:"http://www.168ytt.com/"+arr[0][0].replace(/amp;/g,"")+"&handlekey=fastpost&loc=1&inajax=1",
                    form:{
                        formhash:arr[1][0],
                        replysubmit:true,
                        message:"回复123456789"
                    }
                }
                var xml=$await(Api.postGbk(data))
                if(xml.indexOf("非常感谢，回复发布成功")>-1){

                    html=$await(Api.getContent(cururl))
                    $await(Api.localstore.setAsync(tid,html))
                    console.log("非常感谢，回复发布成功")

                }else{
                    console.log("抱歉，您两次发表间隔少于 15 秒，请稍候再发表")
                    taskData.curIndex--
                }
                $await(Wind.Async.sleep(16000))
            }
        }

        if(ok){
            //执行中的任务
            fs.writeFileSync("tidData.txt",JSON.stringify(taskData))
        }
    }
}))

var test=eval(Wind.compile("async", function (startTask,isneedFresh) {
    $await(Api.startAnt([
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=53&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=57&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=58&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=70&page=1&mobile=2"],false))

   $await(getAllhtml())

}))
test().start()

