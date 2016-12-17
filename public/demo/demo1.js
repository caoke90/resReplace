var glob=require("glob")
var Wind=require("Wind")

module.exports={
    lastTime:null,//下次更新时间
    needUpdate:function(){
        var now=new Date();
        if(!this.lastTime){
            this.lastTime=now.getTime()+0.5*86400000
            return true;
        }
        if(now.getTime()<this.lastTime){
            return false;
        }else{
            return true;
        }
    },
    render:eval(Wind.compile("async", function (req,next) {
        if(!this.isRunning) {
            this.isRunning = true
            if(this.needUpdate()){
                console.log(Api.localstore.setAsync)
                var sp1=$await(Api.localstore.setAsync("hello","word"))
                next(sp1)
            }else{
                Api.localstore.get("hello",function(err,data){
                    next("iscache"+data)
                })

            }
            this.isRunning = false
        }else{
            next("isrunning")
        }
    }))
}