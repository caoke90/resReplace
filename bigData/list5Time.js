
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
function sort3(item1,item2){
    var num1=Number(item1[3].replace("%",""))||0
    var num2=Number(item2[3].replace("%",""))||0
    if(num1>num2){
        return -1
    }if(num1==num2){
        return 0
    }else{
        return 1
    }
}
module.exports={
    //速度
    velocity:0.5*86400000,//30天
    isRunning:false,
    getData:eval(Wind.compile("async", function (req) {
        var cacheFile=__dirname+"/../非债开放申购开放赎回.csv";

        if(fs.existsSync(cacheFile)){
            var stat=fs.statSync(cacheFile)
            var mtime=new Date(stat.mtime)
            var now=new Date()
            if(now-mtime<this.velocity) {
                return "缓存-已排名";
            }
        }
        var list2=$await(Api.getData(__dirname+"/list3filter.js"))
        var title=list2.shift()
        var tileData={}
        var jsonData={}
        //时间段
        list2.forEach(function(item1){
            var code1=item1[0]
            var data=getCvs(__dirname+"/../基金/"+code1+".csv")
            data[0][6]="收益排名";
            jsonData[code1]=data.splice(1,data.length)
            tileData[code1]=data
        })
        var timeData=getCvs(__dirname+"/../基金/"+list2[0][0]+".csv")
        timeData=timeData.splice(1,timeData.length)
        for(var i=0;i<timeData.length;i++){
            var sortArr=[]
            var dataStr=timeData[i][0]
            list2.forEach(function(item1){
                var code1=item1[0]
                var data=getArrbyDate(dataStr,jsonData[code1])
                if(data){
                    sortArr.push(data)
                }
            })
            sortArr.sort(sort3)
            sortArr.forEach(function(arr,k){
                arr[6]=k+1
            })
        }
        for(var code in jsonData){
            var data2=tileData[code].concat(jsonData[code])
                console.log(code)
            saveCvs(__dirname+"/../基金/"+code+".csv",data2)
        }
        return "排名完成";
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