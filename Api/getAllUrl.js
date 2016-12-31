
var url2path=require("url2path")
var path=require("path")
function url2realpath(href){
    var href=href.replace(/\?.+/,"")
    href=href.replace(/(https?:\/\/[\w\.]+\/[^/\.]+$)/i,"$1/")
    href=href.replace(/(\/[a-z0-9]+$)/i,"$1.html")
    var rpath=url2path.url2pathRelative(href);
    rpath=rpath.replace(/(\\.+?\\.+?\\.+?\\.+?\\.+?\\).+\\(.+)$/g,"$1$2")
    rpath=rpath.replace(/\\$/,"/index.html")

    return rpath
}
function getAllUrl(theUrl,html){
    var thefilePath=url2realpath(theUrl).replace(/\\/g,"/")
    var doman,doman2,dir;
    theUrl.replace(/(^https?:\/\/[a-z0-9]+?\.([a-z0-9\.]+))(.*\/)/i,function(m,p1,p2,p3){
        doman=p1
        doman2=p2
        dir=p3
    })

    //忽略注释
    html=html.replace(/\/\*[\d\D]+?\*\//g,"")
    html=html.replace(/<!--[\d\D]+?-->/g,"")
    html=html.replace(/(?=\n|^) *\/\/.+/g,"")

    var dataUrl=[];//原始的url
    html.replace(/.+/g,function(line){
        line.replace(/([a-z]*)[ =]*["'=\(]([\w:\/\.]*\/[\w:\/\.\?#&=_-]+?)["'\) ]/gi,function(m,p1,url){
            if(p1!="type"){
                url=url.replace(/#.+/,"")
                url&&dataUrl.push({
                    thefilePath:thefilePath,
                    oriUrl:url
                })
            }
        })
        line.replace(/([a-z]*)[ =]*["'=\(]([\w:\.\?#&=_-]+?)["'\) ]/gi,function(m,p1,url){
            if(p1=="href"||p1=="url"||p1=="src"){
                url=url.replace(/#.*/,"")
                url&&dataUrl.push({
                    thefilePath:thefilePath,
                    oriUrl:url
                })
            }
        })

    })
    //绝对路径
    dataUrl.map(function(item){
        var url=item.oriUrl
        if(/^\/\//.test(url)){
            url="http:"+url
        }else if(/^\//.test(url)){
            url=doman+url
        }else if(!/^http/.test(url)){
            url=doman+dir+url
        }
        url=url.replace(/\/.\//g,"")
        url=url.replace(doman+"/../",doman+"/")
        item.absUrl=url
        return item;
    })

    //本站的相对路径
    dataUrl.forEach(function(item){
        var url=item.absUrl
        if(url.indexOf(doman2)>-1){
            item.filePath=url2realpath(url).replace(/\\/g,"/")
            item.relUrl=path.relative(item.thefilePath,item.filePath).replace(/\\/g,"/")
        }
        return item;
    })

    console.log(dataUrl)
    return dataUrl;
}

module.exports=getAllUrl;