module.exports=function Task(){
    if(arguments.length>0){
        var sp=new Task()
        sp.init.apply(sp,arguments)
        return sp
    }
}
//已完成的任务、待完成的任务、无效的任务
Task.prototype={
    taskList:null,
    completeList:null,
    errorList:null,
    //初始化任务
    init:function(taskList,completeList,errorList){
        if(Object.prototype.toString.call(taskList)=="[object Array]"){
            this.taskList=taskList
            this.completeList=completeList||[]
            this.errorList=errorList||[]
            return;
        }else if(Object.prototype.toString.call(taskList)=="[object Object]"){
            this.taskList=taskList.taskList
            this.completeList=taskList.completeList
            this.errorList=taskList.errorList
        }else{
            console.log("参数错误")
        }

    },
    getList:function(){
        return [].concat(this.taskList)
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
            return;
        }
        var index=this.errorList.indexOf(tid)
        if(index!=-1){
            this.errorList.splice(index,1)
            this.completeList.push(tid)
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
    add:function(tid){
        var allList=[].concat(this.taskList,this.completeList,this.errorList)
        var index=allList.indexOf(tid)
        if(index!=-1){
            this.taskList.push(tid)
        }
    }
}
//var sp=Task({"taskList":[1,4],"completeList":[3],"errorList":[2]})
//
//sp.complete(3)
//console.log(sp.getList())
//console.log(sp.getAllList())
//console.log(JSON.stringify(sp))