const mongoose=require('mongoose');
const joi=require('joi');
mongoose.set('useCreateIndex', true);//消除警告，也可以不写
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        maxlength:6,
        minlength:2
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    //分为admin和normal
    identity:{
        type:String,
        default:'normal'       
    },
    head:{
       type:String,
       default:'null'
    },
    mood:{
        type:String,
        default:'我是夜空中最亮的星，你呢？',
        maxlength:18
    },
    count:{
        type:Number,
        default:0
    }
});
const User=mongoose.model('User',userSchema);
const validateUser=(user)=>{
   //定义验证规则
   const schema={
    username:joi.string().min(1).max(5).required().error(new Error('昵称过长或过短')),
    email:joi.string().min(3).max(20).required().error(new Error('账号过长或过短')),
    //数字字母开头和结尾，最小5位最大12位
    password:joi.string().regex(/^[a-zA-Z0-9]{5,12}$/).required().error(new Error('密码不符合规范')),
    identity:joi.string().valid('normal','admin'),
    head:joi.string()
 }
  return joi.validate(user,schema);

}

const validateUser2=(user)=>{
    const schema={
     username:joi.string().min(1).max(5).required().error(new Error('昵称过长或过短')),
     email:joi.string().required().error(new Error('账号不符合规范')),
     head:joi.string(),
     mood:joi.string().max(30).error(new Error('个性签名不超过18字')),
     id:joi.string()
  }
   return joi.validate(user,schema); 
 }


module.exports={
    User ,//键值对如果一样，可以省略值
    validateUser,
    validateUser2
}