var Wind=require("wind")
var fs=require("fs")
var path=require("path")

var Api=require("./Api")
var getCvs=function (filepath) {
    var list2Csv=fs.readFileSync(filepath).toString()
    var list2=list2Csv.split("\n")
    try{
        list2=list2.map(function(item){
            var arr=item.split(",")
            return arr
        })
    }catch (e){
        console.log(filepath)
    }

    return list2
}
var saveCvs=function (filepath,data) {
    data.map(function(item){
        return item.join(",")
    })
    fs.writeFileSync(filepath,data.join("\n"))
}
//爬取所有的基金列表数据
var getList=eval(Wind.compile("async", function () {
    var content=$await(Api.getContent("http://fund.eastmoney.com/allfund.html"))

    var data=Api.search(content,[
        /<a href="[^"]+?">（(\d{6})）(.+?)<\/a>/gi
    ])
    data.unshift(["基金代码","基金名称"])
    console.log(data)
    saveCvs("list2.csv",data)
//    console.log(data)
}))
//getList().start()
//爬取单个基金历史数据
var getCodeTable=eval(Wind.compile("async", function (code) {
    var url="http://fund.eastmoney.com/f10/F10DataApi.aspx?type=lsjz&code="+code+"&page=1&per=2000&sdate=&edate=&rt=0.5023676056880504"
    console.log(url)
    var content=$await(Api.getContent(url))
    console.log(content)
    var arr1=Api.search(content,[
        /<tr><th[^<]*?>([^>]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th><th[^>]*?>([^<]*?)<\/th>.*?<\/tr>/g,
        /<tr><td[^<]*?>([^>]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td><td[^>]*?>([^<]*?)<\/td>.*?<\/tr>/g,
    ])
    if(arr1.length==1){return;}

    var data=[].concat(arr1[0],arr1[1])

    data.map(function(item){
        return item.join(",")
    })
    fs.writeFileSync("基金/"+code+".csv",data.join("\n"))
    console.log(data)
}))
//getCodeTable("000009").start()
var getListDetail=eval(Wind.compile("async", function (code,num) {
    var list2=getCvs("list2.csv")
    var title=list2.shift()
    var start=false
    for(var i=0;i<list2.length;i++){
        var code1=list2[i][0]

        if(code1=="001050"){
            start=true
        }
        if(code1=="202301"){
            start=false
        }
        if(start){
            $await(getCodeTable(code1))
        }
    }
}))
//getListDetail().start()
//解析单个基金
var solveData=eval(Wind.compile("async", function (code,num) {
    var list2=getCvs("基金/"+code +".csv")
    //波动值
    var data={}
    var monthData={}
    var newData={}
    var oldData={}
    list2.forEach(function(item,k){
        if(k>0){
            var month=item[0].substr(0,7)

            if(!data[month]){
                data[month]=0
            }
            var risk=Number(item[3].replace("%",""))
            if(risk>num){
                data[month]=data[month]+1
            }
            if(risk<-num){
                data[month]=data[month]+1
            }

            if(!newData[month]){
                if(k>1){
                    var prevmonth=list2[k-1][0].substr(0,7)
                    oldData[prevmonth]=list2[k-1][1]

                    monthData[prevmonth]=Number(newData[prevmonth])-Number(oldData[prevmonth])
                }
                newData[month]=item[1]
            }
        }
    })

//    console.log(list2)
//    console.log(data)
//    console.log(monthData)
    var fenx={}
    for(var k in monthData){
        fenx[k]=monthData[k]/data[k]*100
    }
    console.log(fenx)
    return fenx;
//    console.log(list2)
//    console.log(list2[1][1])
}))
//test2("000009",0.1).start()


//过滤
var filter=eval(Wind.compile("async", function () {

    var list2=getCvs("list2.csv")
    var title=list2.shift()
    var list1=[]
    var list3=[]
    list2.forEach(function(item1){
        var code1=item1[0]
        var data1=getCvs("基金/"+code1+".csv")
        if(data1[0].indexOf("单位净值")>-1&&data1[0].indexOf("累计净值")>-1&&data1[1]&&(data1[1].indexOf("开放申购")>-1||data1[1].indexOf("限制大额申购")>-1)&&data1[1].indexOf("开放赎回")){
            list1.push(item1)
            if(item1[1].indexOf("债")==-1&&item1[1].indexOf("油")==-1){
                list3.push(item1)
            }
        }
    })
    list1.unshift(title)
    list3.unshift(title)
    console.log(list1)
    saveCvs("开放申购开放赎回.csv",list1)
    saveCvs("非债油开放申购开放赎回.csv",list3)

}))

function sort1(item1,item2){
    var num1=item1[2]
    var num2=item2[2]
    if(num1>num2){
        return -1
    }if(num1==num2){
        return 0
    }else{
        return 1
    }
}
//filter().start()
var test3=eval(Wind.compile("async", function (time) {

    var list2=getCvs("非债油开放申购开放赎回.csv")
    var title=list2.shift()
    var jsonData={}
    var fenx={}
    var fenxNum=0.5
    var fenxDate={}
    //时间段
    list2.forEach(function(item1){
        var code1=item1[0]
        jsonData[code1]=getCvs("基金/"+code1+".csv").splice(time[0],time[1])
    })
    //算这段时间的风险
    list2.forEach(function(item1){
        var code1=item1[0]
        var sum=0;
        var len=0;
        jsonData[code1].forEach(function(item,k){
            var num=Number(item[3].replace("%",""))
            if(num>fenxNum){
                sum=sum+num
                len++
            }
            if(num<-fenxNum){
                sum=sum-num
                len++
            }
        })
        if(len>0){
            fenx[code1]=sum/len
            fenxDate[code1]=len
        }else{
            fenxDate[code1]=1
            fenx[code1]=0
        }
    })

    //累计净值增长率排名

    var list1=[]//累计率
    var list4=[]//单位率
    var list5=[]//分红
    var list6=[]//风险
    var list7=[]//性价比
    var dataJSON={
        title:"最近"+time.join("-")+"天",
        xAxis:[],
        series:[{
            "name":"收益率%",
            "type":"line",
            "data":[]
        },{
            "name":"风险%",
            "type":"line",
            "data":[]
        },{
            "name":"性价比",
            "type":"line",
            "data":[]
        }]
    }
    var shouyiJson=dataJSON.series[0]
    var fenxJson=dataJSON.series[1]
    var xinjiaJson=dataJSON.series[2]


    list2.forEach(function(item1){
        var code1=item1[0]
        dataJSON.xAxis.push(code1)
        var data1=jsonData[code1]
        if(data1[0]&&data1[0][2]){
            var num1=Number(data1[0][2])
            var len=data1.length-1
            var num2=Number(data1[len][2])
            var text1=(num1-num2)/num2
            list1.push(item1.concat(text1*100))

            var num1=Number(data1[0][1])
            var len=data1.length-1
            var num2=Number(data1[len][1])
            var text2=(num1-num2)/num2
            list4.push(item1.concat([text2*100,num1,num2]))

            if(text1<0&&text2<0){
                list5.push(item1.concat([text1-text2,text1,text2]))
            }else{
                list5.push(item1.concat([text1-text2,text1,text2]))
            }

            list6.push(item1.concat([fenx[code1]]))

            list7.push(item1.concat([text1*100/fenxDate[code1]-fenx[code1],text1*100,fenx[code1]]))
            xinjiaJson.data.push((text1*100/fenxDate[code1]-fenx[code1]))
            shouyiJson.data.push(text2*100)
            fenxJson.data.push(fenx[code1])
        }else{
            xinjiaJson.data.push(null)
            shouyiJson.data.push(null)
            fenxJson.data.push(null)
        }
    })

    list1.sort(sort1)
    list1.unshift(title.concat("累计净值增长率"+time.join("-")))
    list4.sort(sort1)
    list4.unshift(title.concat("单位净值增长率"+time.join("-")))
    list6.sort(sort1)
    list6.unshift(title.concat(["风险排名"+time.join("-")]))
    list7.sort(sort1)
    list7.unshift(title.concat(["性价比"+time.join("-"),"收益率%","风险"]))


    saveCvs("排行/单位收益排名"+time.join("-")+"天.csv",list4)
//    saveCvs("排行/分红排名"+time.join("-")+"天.csv",list5)
    saveCvs("排行/累计收益排名"+time.join("-")+"天.csv",list1)
    saveCvs("排行/风险排名"+time.join("-")+"天.csv",list6)
    saveCvs("排行/性价比排名"+time.join("-")+"天.csv",list7)
    fs.writeFileSync("图形/data.json",JSON.stringify(dataJSON,null,2))
}))
//getListDetail().start()
//test3([1,10]).start()
//test3([1,20]).start()
//test3([1,30]).start()
//test3([1,40]).start()
//test3([1,50]).start()
//test3([1,60]).start()
//test3([140,200]).start()
//test3([1,200]).start()
//test3([1,30]).start()
test3([1,2]).start()
//test3([60,90]).start()
//test3([90,120]).start()

