var Wind=require("wind")
var fs=require("fs")
var path=require("path")

var copy=require("./copy")
var replace=require("./replace");
var find=require("./find");

var test=eval(Wind.compile("async", function (modeArr2) {
    //组件
//    var modeArr=[
//        //json格式化
//        [/^[\d\D]+$/,function(m){
//            try{
//                var obj=JSON.parse(m)
//                m=JSON.stringify(obj,null,2)
//            }catch(e){}
//            return m
//        }],
//        //inline替换
//        [/__inline\((.+?)\)/g,function(m,p1){
//            var path1=p1.replace(/["']/g,"");
//            var dirname=path.dirname(this.filepath)
//            var filepath1=path.join(dirname,path1)
//            var str=fs.readFileSync(filepath1).toString().replace(/﻿/,"")
//            str=this._super(str,filepath1)
//            return str
//        }],
//        //__intxt替换
//        [/__intxt\((.+?)\)/g,function(m,p1){
//            var path1=p1.replace(/["']/g,"");
//            var dirname=path.dirname(this.filepath)
//            var filepath1=path.join(dirname,path1)
//            var str=fs.readFileSync(filepath1).toString().replace(/﻿/,"")
//            str=this._super(str,filepath1)
//            return "'"+str.replace(/\s/g,"").replace(/'/g,'\\')+"'";
//        }],
//    ]
//
//    for(var i=0;i<modeArr.length;i++){
//        var item=modeArr[i]
//        var cgArr=$await(replace("../zufangdai_stat_data/admin-src/**",item[0],item[1]))
//        console.log(cgArr)
//    }

    var conf=fs.readFileSync("test/url2.txt").toString()
    var arr1=[]
    var arr2=[]
    conf.replace(/.+?#.+/g,function(m,p){
        var arr=m.split("#")
        arr1.push(arr[0])
        arr2.push(arr[1])
    })
//    console.log(arr1)
//    console.log(arr2)
//    var cgArr=$await(replace("../zufangdai_stat_data/admin-src/**",arr1,arr2))
//    console.log(cgArr)
    var arr3=[]
    conf.replace(/\/.+/g,function(m,p){
        arr3.push(m.replace(/#.+/,""))
    })
    console.log(arr3)
    var cgArr=$await(find("../zufangdai_stat_data/admin-src/**",arr3))
    console.log(cgArr)
}))

test().start()


