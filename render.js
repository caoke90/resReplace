
var Api=require("./Api")
Api.render(__dirname+"/test/render/demo.html",{},function(content){
    console.log(content)
})