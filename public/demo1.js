var glob=require("glob")
var Wind=require("Wind")
var Api=require("../Api")
var isListUrl=function(url,listUrls){
    var arr2=listUrls
    for(var i=0;i<arr2.length;i++){
        var regex= arr2[i]
        if(regex.test(url)){
            return true
        }
    }
    return false
}
Api.startAnt=eval(Wind.compile("async", function (startUrls,listUrls,itemUrls) {

    //添加列表

    //获取一个列表html，解析添加list、item，重复这个过程
    //获取url

    var curIndex=0
    var urlCache=[]
    //访问了那些页面
    var tempList=[].concat(startUrls)
    //提取了那些url
    var tempItem=[]
    while(tempList.length>curIndex){
        var cururl=tempList[curIndex]
        curIndex++
        //获取list、item
        var doman=cururl.match(/(http|ftp|https):\/\/[^/]+/)[0]
        //获取html
        var html=$await(Api.getContent(cururl))

        var urlArr=[]
        html.replace(/href *= *(["'])(.*?)\1/gi,function(m,p1,p2){
            urlArr.push(p2)
        })
        urlArr.forEach(function(ourl){

            var url
            if(/(http|ftp|https):\/\//.test(ourl)){
                url=ourl
            }else if(ourl[0]=="/"){
                url=doman+ourl
            }else{
                cururl.replace(/(http|ftp|https):\/\/[^?]+\//,function(m){
                    url=m+ourl
                })
            }
            url=url.replace(/&amp;/g,"&")
            if(urlCache.indexOf(url)==-1){
                if(isListUrl(url,listUrls)){
                    urlCache.push(url)
                    tempList.push(url)
                }
                if(isListUrl(url,itemUrls)){
                    urlCache.push(url)
                    tempItem.push(url)
                }
            }

        })
        console.log(tempList)
        console.log(tempItem)
    }

    console.log("startAnt over")
}))
var transref=function (_route){
    var optionalParam = /\((.*?)\)/g;
    var escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    var namedParam = /(\(\?)?:\w+/g;
    var splatParam = /\*\w+/g;
    var _route = _route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function (match, optional) {
        return optional ? match : '([^/?]+)';
    }).replace(splatParam, '([^?].*?)');
    return  new RegExp("^" + _route + "(?:\\?([\\s\\S]*))?$")
}
Api.startAnt(["http://www.168ytt.com/forum.php?mod=forumdisplay&fid=52&mobile=2"],[],[transref("http://www.168ytt.com/forum.php?mod=viewthread&tid=:id&extra=page%3D1&mobile=2")]).start()