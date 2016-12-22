var glob=require("glob")
var Wind=require("Wind")
var request=require("./request")
var Api=require("../../Api")

var fs=require("fs")
//爬取列表
Api.startAnt=eval(Wind.compile("async", function (startTask,isneedFresh) {

    //获取一个列表html，解析添加list、item，重复这个过程
    //获取url
    var taskData;
    if(fs.existsSync("pageData.txt")){
        taskData=Api.Task(JSON.parse(fs.readFileSync("pageData.txt").toString()))
        if(!taskData.get()){
            taskData.refreshList(startTask)
        }
    }else{
        taskData=Api.Task(startTask)
    }
    //提取了那些url
    var dataData;
    if(fs.existsSync("tidData.txt")){
        dataData=Api.Task(JSON.parse(fs.readFileSync("tidData.txt").toString()))
    }else{
        dataData=Api.Task([])
    }

    while(taskData.get()){
        var cururl=taskData.get()
        console.log(cururl)
        //获取html
        var html=$await(request.getContent(cururl))
        //任务失败
        if(!/<div class="threadlist">/g.test(html)){
            console.log(html)
            //任务失败
            taskData.fail(cururl)
            //执行中的任务
            fs.writeFileSync("pageData.txt",JSON.stringify(taskData))

            break;
        }

        var refresh=false;//是否有更新
        var tempList=Api.search(html,["forum.php?mod=forumdisplay&fid=*&amp;page=*&amp;mobile=2"])
        //添加新的任务
        tempList=tempList.map(function(item){
            var url="http://www.168ytt.com/"+item.replace(/&amp;/g,"&")
            taskData.add(url)
            return url;
        })
        //采集信息
        var tempItem=Api.search(html,[/tid=(\d+)/g])
        //forum.php?mod=viewthread&amp;tid=35641&amp;extra=page%3D237&amp;mobile=2
        tempItem.forEach(function(item){
            var url=item
            if(dataData.add(url)){
                refresh=true
            }
        })
        //内容有更新就爬
        if(refresh){
            //关联更新
            if(cururl=="http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2"){
                var arr=[
                    "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=53&page=1&mobile=2",
                    "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=57&page=1&mobile=2",
                    "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=58&page=1&mobile=2",
                    "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=70&page=1&mobile=2"
                ]
                taskData.refreshList(arr)
            }

            taskData.refreshList(tempList)

            //采集到的数据
            fs.writeFileSync("tidData.txt",JSON.stringify(dataData))
        }

        //完成任务
        taskData.complete(cururl)
        //执行中的任务
        fs.writeFileSync("pageData.txt",JSON.stringify(taskData))



    }
    console.log("startAnt over")
}))
//网络异常、签到、404、反爬虫、无图片页面
var getAllhtml=eval(Wind.compile("async", function (startTask,isneedFresh) {

    //提取了那些url
    var taskData=Api.Task(JSON.parse(fs.readFileSync("tidData.txt").toString()))

    var ok=true
    while(ok&&taskData.get()){
        var tid=taskData.get()
        console.log(tid)
        var cururl="http://www.168ytt.com/forum.php?mod=viewthread&tid="+tid+"&extra=page%3D237&mobile=2"
        console.log(cururl)
        //获取html
        var html=$await(Api.localstore.getAsync(tid))

        if(!html){
            html=$await(request.getContent(cururl))
            $await(Api.localstore.setAsync(tid,html))
        }

        //网络异常
        if(!html){
            console.log("网络异常")
            break;
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
            var xml=$await(request.postGbk(data))
            console.log(xml)
            html=$await(request.getContent(cururl))
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
        }

        //非内容页面
        if(!/\$\('#fastpostsubmit'\)/g.test(html)){
            console.log("非内容页面")
            html=$await(request.getContent(cururl))
            if(/\$\('#fastpostsubmit'\)/g.test(html)){
                $await(Api.localstore.setAsync(tid,html))
            }
        }
        if(/\$\('#fastpostsubmit'\)/g.test(html)){
            //存在图片
            if(/src="forum.php\?mod=image&aid=\d+/g.test(html)) {
                taskData.complete(tid)
                fs.writeFileSync("tidData.txt", JSON.stringify(taskData))
            }else{
                var arr=Api.search(html,[/action="(forum.php.+?)"/,/name="formhash" value="(.+?)"/])
                var data={
                    url:"http://www.168ytt.com/"+arr[0][0].replace(/amp;/g,"")+"&handlekey=fastpost&loc=1&inajax=1",
                    form:{
                        formhash:arr[1][0],
                        replysubmit:true,
                        message:"回复123456789"
                    }
                }
                var xml=$await(request.postGbk(data))
                if(xml.indexOf("非常感谢，回复发布成功")>-1){
                    html=$await(request.getContent(cururl))

                    if(/\$\('#fastpostsubmit'\)/g.test(html)){
                        $await(Api.localstore.setAsync(tid,html))
                        if(/src="forum.php\?mod=image&aid=\d+/g.test(html)){
                            taskData.complete(tid)
                        }else{
                            console.log("无图片页面")
                            taskData.error(tid)
                        }
                        fs.writeFileSync("tidData.txt",JSON.stringify(taskData))
                    }
                    console.log("非常感谢，回复发布成功")
                }else{
                    console.log("抱歉，您两次发表间隔少于 15 秒，请稍候再发表")

                }

                $await(Wind.Async.sleep(16000))
            }
        }else{
            taskData.error(tid)
            fs.writeFileSync("tidData.txt",JSON.stringify(taskData))
            console.log(html)
        }
    }

    console.log("已停止")
}))
var imageTobase64=eval(Wind.compile("async",function(html){

    var arr=Api.search(html,[
        /http:\/\/www\.168ytt\.com\/forum.php\?mod=image&aid=.+?&type=fixnone/g
    ])
    for(var i=0;i<arr.length;i++){
        var url=arr[i]
        var base64=$await(request.getBase64(url))
        html=html.replace(url,base64)
    }
    return html;
}))
//生成静态
var makeStatic=eval(Wind.compile("async",function(){

    if(fs.existsSync("tidData.txt")) {
        var releaseDir=__dirname+"/seeapp"
        if(!fs.existsSync(releaseDir)){
            fs.mkdirSync(releaseDir)
        }
        if(!fs.existsSync(releaseDir+"/nye")){
            fs.mkdirSync(releaseDir+"/nye")
        }
        var taskData = JSON.parse(fs.readFileSync("tidData.txt").toString())
        //生成静态
        var listData = []
        var allData = []
        var jianzhiData = []
        for (var i = 0; i < taskData.completeList.length; i++) {
            var tid = taskData.completeList[i]
            console.log(tid)
            console.log(i)
            var html = $await(Api.localstore.getAsync(tid))
            html = html.replace(/href="forum.php/g, 'href="http://www.168ytt.com/forum.php')
            html = html.replace(/src="forum.php/g, 'src="http://www.168ytt.com/forum.php')

            html = html.replace(/m3m4_ck/g, '')
            html = html.replace(/<?xml version="1.0" encoding="utf-8"\?>/g, '')
            if (!fs.existsSync(releaseDir + "/nye/" + tid + ".html")) {
//                html=$await(imageTobase64(html))
                fs.writeFileSync(releaseDir + "/nye/" + tid + ".html", html)
            }
            var json = {
                tid: tid,
                url: "nye/" + tid + ".html",
                time: new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate(),
                title: /<title>([\d\D]+?)<\/title>/g.exec(html)[1].replace(/&#9654;[\d\D]+?Powered by Discuz!/, ""),
                html: html
            }
            if (/\d{4}-\d{1,2}-\d{1,2} \d+:\d+:\d+/g.exec(html)) {
                json.time = /(\d{4}-\d{1,2}-\d{1,2}) \d+:\d+:\d+/g.exec(html)[1]
            } else {
                if (/昨天&nbsp;/g.exec(html)) {
                    json.time = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + (new Date().getDate() - 1)
                }
                if (/(\d+)&nbsp;天前/g.exec(html)) {
                    json.time = new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + (new Date().getDate() - Number(/(\d+)&nbsp;天前/g.exec(html)[1]))
                }
            }
            allData.push(json)
        }

        allData = allData.sort(function (item1, item2) {
            var p1 = new Date(item1.time).getTime()
            var p2 = new Date(item2.time).getTime()
            return p1 > p2 ? -1 : 1
        })
        allData.forEach(function (json) {
            if (!/会所/g.test(json.title)) {
                jianzhiData.push(json)
                if (!/本帖隐藏的内容需要积分高于 .+ 才可浏览/g.test(json.html)) {
                    listData.push(json)
                }
            }
        })

        var tpl = fs.readFileSync("list.ejs").toString()
        var listhtml = Api.parseTpl(tpl, listData)
        var allhtml = Api.parseTpl(tpl, allData)
        var jianzhihtml = Api.parseTpl(tpl, jianzhiData)
        fs.writeFileSync(releaseDir + "/list.html", listhtml)
        fs.writeFileSync(releaseDir + "/jianzhi.html", jianzhihtml)
        fs.writeFileSync(releaseDir + "/all.html", allhtml)
    }
}))

var test=eval(Wind.compile("async", function (startTask,isneedFresh) {
    $await(Api.startAnt([
        "http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&page=1&mobile=2"
    ],true))

   $await(getAllhtml())
   $await(makeStatic())
    console.log("over")

}))
test().start()

