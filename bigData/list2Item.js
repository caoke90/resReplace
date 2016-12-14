
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
    velocity:0.5*86400000,//30天
    getFirst:eval(Wind.compile("async", function (code,cacheFile) {
        var url="http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code="+code+"&page=1&per=1000&sdate=&edate=&rt=0.5023676056880504";
        console.log(url)
        var content=$await(Api.getContent(url));
        var arr1=Api.search(content,[
            /<tr><th[^<]*?>([^>]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th>.*?<\/tr>/g,
            /<tr><td[^<]*?>([^>]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td>.*?<\/tr>/g
        ])
        var data=[].concat(arr1[0],arr1[1])

        saveCvs(cacheFile,data)
        return data
    })),
    getUpdate:eval(Wind.compile("async", function (code,cacheFile) {
        var url="http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code="+code+"&page=1&per=5&sdate=&edate=&rt=0.5023676056880504"
        var content=$await(Api.getContent(url))
        var arr1=Api.search(content,[
            /<tr><th[^<]*?>([^>]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th>.*?<\/tr>/g,
            /<tr><td[^<]*?>([^>]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td>.*?<\/tr>/g
        ]);
        var oData=getCvs(cacheFile);
        var nData=[]
        arr1[1].forEach(function(item){
            var item2=getArrbyDate(item[0],oData)
            if(!item2){
                nData.push(item)
            }
        })
        nData.forEach(function(item,k){
            oData.splice(k+1,0,item)
        })
        saveCvs(cacheFile,oData)
        return oData
    })),
    getItem:eval(Wind.compile("async", function (code) {

        var cacheFile=__dirname+"/../基金/"+code+".csv"
        if(fs.existsSync(cacheFile)){
            var stat=fs.statSync(cacheFile)
            var mtime=new Date(stat.mtime)
            var now=new Date();
            if(now.getTime()-mtime.getTime()<this.velocity){
                var data=getCvs(cacheFile);
                return data;
            }else{
                var data=$await(this.getFirst(code,cacheFile))
                return data
            }
        }else{
            var data=$await(this.getFirst(code,cacheFile))
            return data
        }
    })),
    getData:eval(Wind.compile("async", function (req) {
        var cacheFile=__dirname+"/list1.js";
        var list= $await(Api.getData(cacheFile))
        var title=list.shift()
        var json={}

        for(var i=0;i<list.length;i++){
            var item=list[i]
            var code=item[0]
            var data=$await(this.getItem(code))
            json[code]=data;
        }
        return json;
    })),
    render:eval(Wind.compile("async", function (req,next) {
        if(!this.isRunning){
            this.isRunning=true
            var data=$await(this.getData(req));
            this.isRunning=false
            next("21121")
        }else{
            next("isrunning")
        }
    }))
}