var Wind=require("wind")
var fs=require("fs")
var path=require("path")

var copy=require("./copy")
var replace=require("./replace");
var find=require("./find");
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
    var cgArr=$await(replace("../zufangdai_stat_data/admin-src/**",cgArr))
    console.log(cgArr)


}))
//test2().start()


var test3=eval(Wind.compile("async", function () {
    var cgArr=$await(search("http://www.cnblogs.com/fengmk2/archive/2011/05/15/2047109.html",["<title>(*)<","问题:*"]))
    console.log(cgArr)
}))
//test3().start()
