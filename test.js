var Wind=require("wind")
var fs=require("fs")
var path=require("path")

var copy=require("./copy")
var replace=require("./replace");
var search=require("./search");

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
    var cgArr=$await(replace("../zufangdai_stat_data/admin-src/**",modeArr))
    console.log(cgArr)


}))

//test().start()

var test2=eval(Wind.compile("async", function (modeArr2) {
    var cgArr=$await(search("test/url2.txt",[/([a-z\/-]+)#([a-z\/-]+)/gi]))
    console.log(cgArr)
//    var cgArr=$await(replace("../zufangdai_stat_data/admin-src/**",cgArr))
//    console.log(cgArr)


}))
//test2().start()
function getInfo(html,midNum,regstr){
    //去掉注释
    html=html.replace(/<!--.+?-->/g,"")
    var arrP=[]
    var reg=/<(p|h1|h2|h3|h4|h5|pre|blockquote|table)( +[^>]*>|>)[\d\D]*?<\/\1>/gi

    html.replace(reg,function(m){

        var start=arguments[arguments.length-2]
        var json={
            start:start,
            end:start+ m.length,
            power:m.length
        }
        m.replace(/[\u4e00-\u9fa5]/g,function(){
            json.power+=2
        })
        arrP.push(json)
    })
//    console.log(arrP)
    var bigData={}
    var dongArr=[]
    for(var i=0;i<arrP.length;i++){
        if(i==0){
            bigData=dongArr[i]=arrP[i]
            continue;
        }
        if(/<\/(a|li)>\s*<(a|li)/gi.test(html.substring(arrP[i-1].end,arrP[i].start))||/<\/div>[\d\D]*<\/div>/gi.test(html.substring(arrP[i-1].end,arrP[i].start))||/<\/(script|style|link|form)>/gi.test(html.substring(dongArr[i-1].start,arrP[i].end))){
            dongArr[i]=arrP[i]
        }else{
            dongArr[i]={
                start:dongArr[i-1].start,
                end:arrP[i].end,
                power:dongArr[i-1].power+arrP[i].power
            }
        }
        if(dongArr[i].power>bigData.power){
            bigData=dongArr[i]
        }
    }
    var cont=html.substring(bigData.start,bigData.end)

    return cont
}

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
        "http://www.readnovel.com/novel/358042/3.html",
//        "https://github.com/webpack/css-loader",
//        "http://china.ynet.com/3.1/1611/29/12059306.html"
    ]
    for(var i=0;i<urlArr.length;i++){
        var url=urlArr[i]
        var cgArr=$await(search(url,[
            "<title>*<\/title>",
            /^[\d\D]+$/
        ]))
        var info=getInfo(cgArr[1][0])
        console.log(url,"\n__________________")
        console.log(info)
    }

}))
test3().start()

