
var Wind=require("wind")
var fs=require("fs")
var res=require("./res");

var jsonFormat=require("./jsonFormat.res")
var inline=require("./inline.res")
var replace=require("./strToStr.res")
var copy=require("./copy")


var test=eval(Wind.compile("async", function (zhiling,filepath) {

    if(zhiling.indexOf("b")>-1) {
        /*inline Test*/
        $await(res("test/**.js", inline()));
        $await(res("test/**.js", inline("intxt")));
    }
    if(zhiling.indexOf("a")>-1){
        /*replace Test*/
        var txt=fs.readFileSync("test/url2.txt").toString()
        var arr1=[];
        var arr2=[];
        txt.replace(/[\w\W]+?\n/g,function(m,p1,p2){
            var arr=m.split("\t")
            arr1.push(arr[0])
            arr2.push(arr[1])
        })
        console.log(arr1)
        console.log(arr2)
        $await(res("../zufangdai_stat_data/admin-src/src/**",replace(arr1,arr2)));
    }

    if(zhiling.indexOf("c")>-1) {
        //格式化json
        $await(res("../zufangdai_web_audit/admin-src/manage/**", jsonFormat()))
    }
    if(zhiling.indexOf("f")>-1) {
        //格式化json
        $await(copy("test/**", "release"));
    }
}))
test("f").start()