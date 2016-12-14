
var fs=require("fs")
var Wind=require("Wind")
var saveCvs=function (filepath,data) {
    data.map(function(item){
        return item.join(",")
    })
    fs.writeFileSync(filepath,data.join("\n"))
}
var getCvs=function (filepath) {
    var list2Csv=fs.readFileSync(filepath).toString()
    var list2=list2Csv.split("\n")
    list2=list2.map(function(item){
        var arr=item.split(",")
        return arr
    })
    return list2
}

module.exports={
    //速度
    velocity:30*86400000,//30天
    getData:eval(Wind.compile("async", function (req) {
        var cacheFile=__dirname+"/list1.csv";
        if(fs.existsSync(cacheFile)){
            var stat=fs.statSync(cacheFile)
            var mtime=new Date(stat.mtime)
            var now=new Date()
            if(now-mtime<this.velocity){
                var list2=getCvs(cacheFile)
                return list2;
            }
        }
        var content=$await(Api.getContent("http://fund.eastmoney.com/allfund.html"))
        var data=Api.search(content,[
            /<a href="[^"]+?">（(\d{6})）(.+?)<\/a>/gi
        ])

        data.unshift(["基金代码","基金名称"])
        saveCvs(cacheFile,data)
        return data;
    }))
}