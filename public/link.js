var glob=require("glob")

module.exports={
    render:function(req,next){
        var ejs=glob.sync("**/*.ejs",{nodir:true})
        var html=glob.sync("**/*.html",{nodir:true})
        ejs.forEach(function(item,k){
            ejs[k]=item.replace(/\.ejs$/,"")
        })

        next({
            ejs:ejs,
            html:html
        })
    }
}