const express=require('express');
const app=express();
const path=require('path');
const home=require('./route/home');
const admin=require('./route/admin');
const session=require('express-session');//引入session模块
const bodyParser=require('body-parser');//用来处理post请求参数
const template=require('art-template');
const dateFormat=require('dateformat');//时间格式化模块，依赖原始template
const morgan=require('morgan');
const config=require('config');
require('./model/connect.js');
// const cors=require('cors');
// app.use(cors())

//为express框架设置默认模板的位置
app.set('views',path.join(__dirname,'views'));
//为express框架设置默认的模板后缀
app.set('view engine','art');
//当获取art模板文件时，使用什么模板引擎进行渲染
app.engine('art',require('express-art-template'));
//导入外部变量,时间格式化
template.defaults.imports.dateFormat=dateFormat;
//配置session,'secret key'自定义名字,可以加密
app.use(session({secret:'secret key'}));
//登陆拦截，如果用户没有登录，则不能访问管理页面
app.use('/admins',require('./middleware/loginGuid'));
//开放静态资源文件，设置路径
app.use(express.static(path.join(__dirname,'public')));//静态资源要设置绝对路径，相对于public的绝对路径
console.log(config.get('title'));
//配置系统环境
if(process.env.NODE_ENV=='development'){
    console.log('开发环境模式启动');
    app.use(morgan('dev'));
}else{
    console.log('生产环境模式启动')
}
//解决跨域问题
// app.use(cors({
//     methods:['GET','POST'],  //指定接收的请求类型
//     alloweHeaders:['Content-Type','Authorization']  //指定header
// }))
// 处理post请求，解析为对象，添加到req，key为body
app.use(bodyParser.urlencoded({extended:false}));
app.use('/home',home);
app.use('/admins',admin);

app.use((err,req,res,next)=>{
    const {path,message}=JSON.parse(err);
    res.redirect(`${path}?message=${message}`);
});
app.listen(80);
