
var fs=require("fs")
var Wind=require("Wind")
var getCvs=function (filepath) {
    var list2Csv=fs.readFileSync(filepath).toString()
    var list2=list2Csv.split("\n")
    list2=list2.map(function(item){
        var arr=item.split(",")
        return arr
    })
    return list2
}
var saveCvs=function (filepath,data) {
    var arr=[]
    data.forEach(function(item){
        arr.push(item.join(","))
    })
    fs.writeFileSync(filepath,arr.join("\n"))
}
function getArrbyDate(dataStr,data){
    for(var i=0;i<data.length;i++){
        if(data[i][0]==dataStr){
            return data[i]
        }
    }
}
module.exports={
    //速度
    velocity:30*86400000,//30天
    isRunning:false,
    getData:eval(Wind.compile("async", function (req) {

        var cacheFile=__dirname+"/../非债开放申购开放赎回.csv";

        if(fs.existsSync(cacheFile)){
            var stat=fs.statSync(cacheFile)
            var mtime=new Date(stat.mtime)
            var now=new Date()
            if(now-mtime<this.velocity) {
                var data = getCvs(cacheFile);
                return data;
            }
        }
        var list= $await(Api.getData(__dirname+"/list1.js"))
        var title=list.shift()
        var list1=[]
        for(var i=0;i<list.length;i++){
            var item1=list[i]
            var code1=item1[0]
            var data1=getCvs(__dirname+"/../基金/"+code1+".csv")
            if(data1[0].indexOf("单位净值")>-1&&data1[0].indexOf("累计净值")>-1&&data1[1]&&(data1[1].indexOf("开放申购")>-1||data1[1].indexOf("限制大额申购")>-1)&&data1[1].indexOf("开放赎回")){
                if(item1[1].indexOf("债")==-1){
                    list1.push(item1)
                }
            }
        }
        list1.unshift(title)
        saveCvs(cacheFile,list1)
        return list1

    })),
    render:eval(Wind.compile("async", function (req,next) {
        if(!this.isRunning){
            this.isRunning=true
            var data=$await(this.getData(req))
            this.isRunning=false
            next(data)
        }else{
            next("isrunning")
        }

    }))
}