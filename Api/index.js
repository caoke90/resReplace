
var Api=module.exports={
    mkdir:require("./mkdir"),
    replace:require("./replace"),
    search:require("./search"),
    getContent:require("./getContent").getContent,
    postGbk:require("./getContent").postGbk,

    getInfo:require("./getInfo"),
    parseTpl:require("./parseTpl"),
    render:require("./render"),
    getData:require("./getData"),
};

var redis = require("redis");
//开启redis服务
Api.startRedis=function(){
    var exec=require('child_process').exec
    exec('cd '+__dirname+'/redis/&&start redis-server ./redis.conf');
}

//退出redis服务
Api.stopRedis=function(){
    var exec=require('child_process').exec
    exec('cd '+__dirname+'/redis/&&start redis-cli -p 6379 shutdown');
}

Api.localstore = redis.createClient({
    port:6379
});
Api.isRunning=false
Api.localstore.on("error",function(){
    if(!Api.isRunning){
        Api.isRunning=true
        console.log("redis不存在！启动")
        Api.startRedis()
    }else{
        Api.localstore.quit()
    }
})
var Wind=require("Wind")
Wind.logger.level = Wind.Logging.Level.WARN;
function setAsync(key){
    Api.localstore[key+"Async"] = Wind.Async.Binding.fromCallback(function(){
        var arr=Array.prototype.slice.call(arguments)
        var callback=arr.pop()
        arr.push(function(err,value){
            callback(value)
        })
        Api.localstore[key].apply(Api.localstore,arr)
    })
}
for(var k in Api.localstore){
    if(typeof Api.localstore[k]=="function"){
        setAsync(k)
    }
}

//完美的js继承 少了类管理器
Object.extend=function(){
    var fnTest = /\b_super\b/;
    //继承父类
    var _super = arguments[0].prototype||this.prototype;

    var prototype=Object.create(_super)

    //初始化函数ctor
    var _Class=function(){
        if (this.ctor)
            this.ctor.apply(this, arguments);
    }
    _Class.prototype = prototype;

    //当前类属性和方法
    var prop = arguments[arguments.length-1];
    for (var name in prop) {
        var isFunc = (typeof prop[name] === "function");
        var override = (typeof _super[name] === "function");
        var hasSuperCall = fnTest.test(prop[name]);

        if (isFunc && override && hasSuperCall) {
            prototype[name] = (function (name, fn) {
                return function () {
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            })(name, prop[name]);
        } else {
            prototype[name] = prop[name];
        }
    }

    //类继承
    _Class.extend=Object.extend;
    //类扩展
    _Class.expand = function (prop) {
        for (var name in prop) {
            prototype[name] = prop[name];
        }
    };
    return _Class

}

//大数据类
Api.BigClass=Object.extend({
    lastTime:null,//下次更新时间
    velocity:1,//下次更新时间
    hasCache:function(){
        var now=new Date();
        if(!this.lastTime){
            this.lastTime=now.getTime()+this.velocity*86400000
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
            $await(this.getData(req,next))
            this.isRunning = false
        }else{
            next("isrunning")
        }
    }))
})