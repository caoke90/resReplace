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
        if(ok){
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
//网络异常、签到、404、反爬虫、无图片页面
var getAllhtml=eval(Wind.compile("async", function (startTask,isneedFresh) {

    //提取了那些url
    var taskData={
        curIndex:0,
        taskList:[]
    }
    if(fs.existsSync("tidData.txt")){
        taskData=JSON.parse(fs.readFileSync("tidData.txt").toString())
        console.log(taskData.curIndex)
        console.log(taskData.taskList.length)
        taskData.curIndex=0
//        taskData.length=taskData.taskList.length

    }

    var ok=true
    while(ok&&taskData.length>taskData.curIndex){
        var tid=taskData.taskList[taskData.curIndex++]
        console.log(tid)
        var cururl="http://www.168ytt.com/forum.php?mod=viewthread&tid="+tid+"&extra=page%3D237&mobile=2"
        console.log(cururl)
        //获取html
        var html=$await(Api.localstore.getAsync(tid))

        if(!html){
            html=$await(Api.getContent(cururl))
            $await(Api.localstore.setAsync(tid,html))
        }

        //网络异常
        if(!html){
            console.log("网络异常")
            ok=false
        }
        //防止爬虫
        if(/<html><body><script/.test(html)){
            console.log("反爬虫")
            cururl="http://www.168ytt.com"+eval(/window\.location=([\d\D]+);/.exec(html)[1])
            html=$await(Api.getContent(cururl))
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
            console.log(cururl)
        }

        //每日签到
        if(/<title>每日签到/g.test(html)){
            console.log("签到")
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
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
        }

        //非内容页面
        if(!/\$\('#fastpostsubmit'\)/g.test(html)){
            console.log("非内容页面")
            html=$await(Api.getContent(cururl))
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
        }
        if(/\$\('#fastpostsubmit'\)/g.test(html)){

            //是否需要回复
            if(!/src="forum.php\?mod=image&aid=\d+/g.test(html)){
                console.log(taskData.curIndex)

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

                    if(/\$\('#fastpostsubmit'\)/g.test(html)){
                        $await(Api.localstore.setAsync(tid,html))
                        if(!/src="forum.php\?mod=image&aid=\d+/g.test(html)){
                            console.log("无图片页面")
                            var temp=taskData.taskList[--taskData.length]
                            taskData.taskList[--taskData.curIndex]=temp
                            taskData.taskList[taskData.length]=tid

                        }
                        fs.writeFileSync("tidData.txt",JSON.stringify(taskData))
                    }
                    console.log("非常感谢，回复发布成功")
                }else{
                    console.log("抱歉，您两次发表间隔少于 15 秒，请稍候再发表")
                    taskData.curIndex--
                }

                $await(Wind.Async.sleep(16000))
            }
        }else{
            var temp=taskData.taskList[--taskData.length]
            taskData.taskList[--taskData.curIndex]=temp
            taskData.taskList[taskData.length]=tid
        }
    }
    fs.writeFileSync("tidData.txt",JSON.stringify(taskData))
    var listData=[]
    var allData=[]
    var jianzhiData=[]
    for(var i=0;i<taskData.curIndex;i++){
        var tid=taskData.taskList[i]
        var html=$await(Api.localstore.getAsync(tid))
        html=html.replace(/href="forum.php/g,'href="http://www.168ytt.com/forum.php')
        html=html.replace(/src="forum.php/g,'src="http://www.168ytt.com/forum.php')
        html=html.replace(/m3m4_ck/g,'')
        html=html.replace(/<?xml version="1.0" encoding="utf-8"\?>/g,'')
        if(!fs.existsSync(__dirname+"/nye/"+tid+".html")){
            fs.writeFileSync(__dirname+"/nye/"+tid+".html",html)
        }
        var json={
            tid:tid,
            time:new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+new Date().getDate(),
            title:/<title>([\d\D]+?)<\/title>/g.exec(html)[1].replace(/&#9654;[\d\D]+?Powered by Discuz!/,""),
            html:html
        }
        if(/\d{4}-\d{1,2}-\d{1,2} \d+:\d+:\d+/g.exec(html)){
            json.time=/(\d{4}-\d{1,2}-\d{1,2}) \d+:\d+:\d+/g.exec(html)[1]
        }else{
            if(/昨天&nbsp;/g.exec(html)){
                json.time=new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+(new Date().getDate()-1)
            }
            if(/(\d+)&nbsp;天前/g.exec(html)){
                json.time=new Date().getFullYear()+"-"+(new Date().getMonth()+1)+"-"+(new Date().getDate()-Number(/(\d+)&nbsp;天前/g.exec(html)[1]))
            }
        }
        allData.push(json)
    }

    allData=allData.sort(function(item1,item2){
        var p1=new Date(item1.time).getTime()
        var p2=new Date(item2.time).getTime()
        return p1>p2?-1:1
    })
    allData.forEach(function(json){
        if(!/会所/g.test(json.title)){
            jianzhiData.push(json)
            if(!/本帖隐藏的内容需要积分高于 .+ 才可浏览/g.test(json.html)){
                listData.push(json)
            }
        }
    })


    var tpl=fs.readFileSync("list.ejs").toString()
    var listhtml=Api.parseTpl(tpl,listData)
    var allhtml=Api.parseTpl(tpl,allData)
    var jianzhihtml=Api.parseTpl(tpl,jianzhiData)
    fs.writeFileSync(__dirname+"/list.html",listhtml)
    fs.writeFileSync(__dirname+"/jianzhi.html",jianzhihtml)
    fs.writeFileSync(__dirname+"/all.html",allhtml)
    console.log("已停止")
}))

var test=eval(Wind.compile("async", function (startTask,isneedFresh) {
    $await(Api.startAnt([
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=53&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=57&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=58&page=1&mobile=2",
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=70&page=1&mobile=2"
    ],false))

   $await(getAllhtml())

}))
test().start()

