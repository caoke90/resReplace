var glob=require("glob")

module.exports={
    //速度
    velocity:0.5*86400000,//30天
    lastTime:null,
    needUpdate:function(){
        var now=new Date();
        if(!this.lastTime){
            this.lastTime=now.getTime()
            return true;
        }
        if(now.getTime()-this.lastTime<this.velocity){
            return false;
        }else{
            return true;
        }
    },
    render:function(req,next){
        if(!this.isRunning) {
            this.isRunning = true
            if(this.needUpdate()){
                next("hello word")
            }else{
                next("iscache")
            }
            this.isRunning = false
        }else{
            next("isrunning")
        }
    }
}