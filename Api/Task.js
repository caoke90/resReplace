function Task(){
    if(arguments.length>0){
        var sp=new Task()
        sp.init.apply(sp,arguments)
        return sp
    }
}
module.exports=Task;
Array.prototype.unique3 = function(){
    var res = [];
    var json = {};
    for(var i = 0; i < this.length; i++){
        if(!json[this[i]]){
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
}
Array.prototype.remove = function(tid){
    var index=this.indexOf(tid)
    if(index>-1){
        this.splice(index,1)
    }
}
//已完成的任务、待完成的任务、无效的任务
Task.prototype={
    taskList:null,
    completeList:null,
    errorList:null,
    //初始化任务
    init:function(taskList,completeList,errorList){
        this.curcompleteList=[]
        if(Object.prototype.toString.call(taskList)=="[object Array]"){
            this.taskList=taskList
            this.completeList=completeList||[]
            this.errorList=errorList||[]
            return;
        }else if(Object.prototype.toString.call(taskList)=="[object Object]"){
            this.taskList=taskList.taskList
            this.completeList=taskList.completeList||[]
            this.errorList=taskList.errorList||[]
        }else{
            console.log("参数错误")
        }
        this.taskList=this.taskList.unique3()
        this.completeList=this.completeList.unique3()


    },
    getList:function(){
        return this.taskList
    },
    getAllList:function(){
        return [].concat(this.taskList,this.completeList,this.errorList)
    },
    //完成任务
    complete: function (tid) {
        var index=this.taskList.indexOf(tid)
        if(index!=-1){
            this.taskList.splice(index,1)
            this.completeList.push(tid)
            this.curcompleteList.push(tid)
            return;
        }
        var index=this.errorList.indexOf(tid)
        if(index!=-1){
            this.errorList.splice(index,1)
            this.completeList.push(tid)
            this.curcompleteList.push(tid)
            return;
        }
    },
    //失败
    fail: function (tid) {
        var index=this.taskList.indexOf(tid)
        if(index!=-1){
            var arr=this.taskList.splice(index,1)
            this.taskList.push(arr[0])
            return;
        }
    },
    error: function (tid) {
        var index=this.taskList.indexOf(tid)
        if(index!=-1){
            this.taskList.splice(index,1)
            this.errorList.push(tid)
            return;
        }
        var index=this.completeList.indexOf(tid)
        if(index!=-1){
            this.completeList.splice(index,1)
            this.errorList.push(tid)
            return;
        }
    },
    //刷新任务
    refresh:function(tid){
        var allList=[].concat(this.taskList,this.errorList,this.curcompleteList)
        var index=allList.indexOf(tid)
        if(index==-1){
            this.completeList.remove(tid)
            this.taskList.push(tid)
        }
    },
    refreshList:function(list){
        var self=this
        list.forEach(function(tid){
            self.refresh(tid)
        })
    },
    add:function(tid){
        var allList=[].concat(this.taskList,this.completeList,this.errorList)
        var index=allList.indexOf(tid)
        if(index==-1){
            this.taskList.push(tid)
            return true
        }else{
            return false
        }
    },
    get:function(){
        return this.taskList[0]
    }
}
//var sp=Task({"taskList":[1,4],"completeList":[3],"errorList":[2]})
//
//sp.complete(3)
//console.log(sp.getList())
//console.log(sp.getAllList())
//console.log(JSON.stringify(sp))