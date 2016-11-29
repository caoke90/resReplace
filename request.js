var request = require('request').defaults({
    encoding: null,
    headers:{
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11'
    }
});
module.exports=request;

request.post("https://meican.com/account/directlogin",{
    form:{
        username:"caoke@58ganji.com",
        password:"907167",
        loginType:"username",
        code:"y6qpe",
        rand:"0fa248bf-00fa-4710-a4b2-f3194f06b616"
    }
},function(err,res,body){
    console.log(res.headers)

    var cookiestr=""
    res.headers["set-cookie"].forEach(function(item){
        cookiestr=cookiestr+item.replace(/;.+/,";")
    })
    request=request.defaults({
        headers:{
            cookie:cookiestr
        }
    })
    console.log(cookiestr)
    request.get("https://meican.com/",function(err,res,body){
        console.log(body.toString())
    })
})