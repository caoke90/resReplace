function getInfo(html){
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
module.exports=getInfo;