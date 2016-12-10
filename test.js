var Wind=require("wind")
var fs=require("fs")
var path=require("path")

var Api=require("./Api")

var test=eval(Wind.compile("async", function (modeArr2) {
    //组件
    var modeArr=[
        //json格式化
        [/^[\d\D]+$/,function(m){
            try{
                var obj=JSON.parse(m)
                m=JSON.stringify(obj,null,2)
            }catch(e){}
            return m
        }],
        //inline替换
        [/__inline\((.+?)\)/g,function(m,p1){
            var path1=p1.replace(/["']/g,"");
            var dirname=path.dirname(this.filepath)
            var filepath1=path.join(dirname,path1)
            var str=fs.readFileSync(filepath1).toString().replace(/﻿/,"")
            str=this._super(str,filepath1)
            return str
        }],
        //__intxt替换
        [/__intxt\((.+?)\)/g,function(m,p1){
            var path1=p1.replace(/["']/g,"");
            var dirname=path.dirname(this.filepath)
            var filepath1=path.join(dirname,path1)
            var str=fs.readFileSync(filepath1).toString().replace(/﻿/,"")
            str=this._super(str,filepath1)
            return "'"+str.replace(/\s/g,"").replace(/'/g,'\\')+"'";
        }]
    ]
    var cgArr=$await(Api.replace("../zufangdai_stat_data/admin-src/**",modeArr))
    console.log(cgArr)


}))

//test().start()

var test2=eval(Wind.compile("async", function (modeArr2) {
    var content=$await(Api.getContent("test/url2.txt"))
    var cgArr=Api.search(content,[/([a-z\/-]+)#([a-z\/-]+)/gi])
    console.log(content)
    var cgArr=$await(Api.replace("../zufangdai_stat_data/admin-src/**",cgArr[0]))
    console.log(cgArr)


}))
//test2().start()


var test3=eval(Wind.compile("async", function () {
    var urlArr=[
        "http://www.w3school.com.cn/xhtml/xhtml_standardattributes.asp",
        "http://china.ynet.com/3.1/1611/29/12057344.html",
        "http://blog.csdn.net/gyflyx/article/details/7890207",
        "http://news.yesky.com/focus/14/106845014.shtml",
        "http://www.mnw.cn/news/shehui/1478248.html",
        "http://www.sxdaily.com.cn/n/2016/1129/c322-6058732.html",
        "http://d.youth.cn/sk/201611/t20161129_8896142.htm",
        "http://sd.china.com.cn/a/2016/yaowen_1129/811771.html",
        "http://ex.cssn.cn/wh/wh_whrd/201611/t20161129_3294432.shtml",
        "http://www.bcty365.com/content-69-3455-1.html",
        "http://read.qidian.com/chapter/ktoOGqR_IA8JiWg6PYdjVg2/vsg8Gk6oO7uaGfXRMrUjdw2",
        "https://github.com/css-modules/css-modules",
        "http://forex.cngold.com.cn/gnrd/20161129d11024n103112138.html",
        "http://www.readnovel.com/partlist/352058.html",
        "https://github.com/webpack/css-loader",
        "http://china.ynet.com/3.1/1611/29/12059306.html",
        "http://oil.cngold.com.cn/20161130d1816n103335895.html"
    ]
    var tpl=fs.readFileSync("info/tpl.html").toString()
    for(var i=0;i<urlArr.length;i++){
        var url=urlArr[i]
        var content=$await(Api.getContent(url))
        var info=Api.getInfo(content)
        var title=Api.search(content,[
            /<title>\s*([\d\D]+?)\s*<\/title>/
        ])
        console.log(url,"_____________________________________")
//        console.log(content)
        console.log(title)
        console.log(info)
        fs.writeFileSync("info/"+i+".html",Api.parseTpl(tpl,{
              title:title,
              info:info
        }))
    }

}))
test3().start()


