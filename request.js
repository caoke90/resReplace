var request = require('request').defaults({
    encoding: null,
    headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
    }
});
module.exports=request;

//request.post("https://meican.com/account/directlogin",{
//    form:{
//        username:"caoke@58ganji.com",
//        password:"907167",
//        loginType:"username",
////        code:"y6qpe",
////        rand:"0fa248bf-00fa-4710-a4b2-f3194f06b616"
//    }
//},function(err,res,body){
//    console.log(res.headers)
//
//    request=request.defaults({
//        headers:{
//            cookie:res.headers["set-cookie"].join("")
//        }
//    })
//    request({
//        method:"post",
//        url:"https://meican.com/preorder/cart/update",
//        "Content-Type":"text/plain",
//        formData:JSON.stringify({"09af785e-9d95-426e-97e2-2ea438b8fd96/2016-11-30 16:30":{"dishes":[{"name":"农家小炒肉套餐(配软饮&木耳油菜&芹菜花生&米饭&大饼/58专供)","revisionId":64608865,"count":1,"priceInCent":2500}],"corpName":"58同城（A1楼）","tabUUID":"09af785e-9d95-426e-97e2-2ea438b8fd96","tabName":"58同城（A1楼）晚餐","operativeDate":"2016-11-30"}})
//    },function(err,res,body){
//        console.log(body.toString())
//    })
//})