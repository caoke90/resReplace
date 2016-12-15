var glob=require("glob")

module.exports={
    render:function(req,next){
        var list=glob.sync("**/*.ejs",{nodir:true})
        list.forEach(function(item,k){
            list[k]=item.replace(/\.ejs$/,"")
        })
        next({list:list})
    }
}