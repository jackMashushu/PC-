const express=require('express');
const {Article,Share,Friend}=require('../model/article');
const {Comment,Leave}=require('../model/comment');
const {User,validateUser,validateUser2}=require('../model/user');
const pagination=require('mongoose-sex-page');
const formidable=require('formidable');
const path=require('path');
const home=express.Router();  //注意路由对象需要手动创建，只需要调用express下的router方法即可

//首页路由
home.get('/index',async (req,res)=>{
   let page=req.query.page;
   let ski=(page-0-1)*7;
   let count=await Article.countDocuments({verify:true,isTop:false});//查询数据库集合里的数据总数，{条件}，不写就是所有
   let result=await Article.find({verify:true,isTop:false},{describe:1,cover:1,publishDate:1,title:1,class:1})
   .sort('-publishDate')
   .skip(ski).limit(7).populate('author',{username:1,_id:0});
   res.send({
      result:result,
      total:count
   });
  
});
//用户注册路由配置(由于有登陆拦截，所以admin.js里面不接受其它请求，需要在这设置)
home.post('/register',async (req,res)=>{
   
   req.session.ip=req.connection.remoteAddress;

   if(req.session.regnum==2){
      res.send('已经注册过了')
      return
   }
   req.session.regnum=1

   try{
      await validateUser(req.body);
   }catch(e){
      //验证失败直接返回错误信息
      res.send(e.message);
      return
   }
   await User.create(req.body).then(()=>{
      //放里面判断，当注册成功则不能第二次注册
      if(req.session.ip){
         if(req.session.ip==req.connection.remoteAddress){
            req.session.regnum++
         }else{
         req.session.ip=req.connection.remoteAddress;
         }
      }else{
         req.session.ip=req.connection.remoteAddress; 
      }

      res.send('bingo');
      return
   }).catch((err)=>{
      res.send('账号重复');
      return
   })
})



//文章详情页路由
home.get('/article',async (req,res)=>{
   req.session.num=1
   const id=req.query.id;
   let article= await Article.findOne({_id:id,verify:true},{isTop:0,notice:0,original:0,verify:0}).populate('author',{username:1});
   let comments= await Comment.find({atcId:id}).populate('userId',{head:1,username:1}).sort('-time');
   let islogin=false,userInfoId=''; 
   const currentDate=article.publishDate;
   //上一篇下一篇
   const nextArticle=await Article.findOne({publishDate:{$gt:currentDate},verify:true},{_id:1,title:1});
   const befArticle=await Article.findOne({publishDate:{$lt:currentDate},verify:true},{_id:1,title:1});
   if(req.app.locals.userInfo){
      islogin=true;
      userInfoId=req.app.locals.userInfo._id;
   }
   res.send({
      article:article,
      comments:comments, 
      islogin:islogin,
      userInfoId:userInfoId,
      next:nextArticle,
      before:befArticle
   });
});
// 评论路由
home.post('/comment',async (req,res)=>{
   const {content,atcId,userId}=req.body;
   if(content.length>200){
      res.redirect('/home/article?id='+atcId);
      return;
   }else{
      await Comment.create({
         content:content,
         atcId:atcId,
         userId:userId,
         time:new Date()
    })
    res.redirect('/home/article?id='+atcId);
   }  
});
//点赞路由
home.get('/praise',async (req,res)=>{

   if(req.session.ip){
      if(req.session.ip==req.connection.remoteAddress){
         req.session.num++
         if(req.session.num>10){
            res.send('fail')
            return
         }
      }else{
      req.session.ip=req.connection.remoteAddress;
      }
   }else{
      req.session.ip=req.connection.remoteAddress; 
   }
   
   
   if(req.query.love){
      await Article.updateOne({_id:req.query.id},{love:req.query.love}).then(()=>{
         res.send('点赞成功！')
         return;
      });    
   }
   if(req.query.hate){
      await Article.updateOne({_id:req.query.id},{hate:req.query.hate}).then(()=>{
         res.send('点踩成功！')
         return;
      });    
   }
});
// 相关文章路由，
home.get('/correlation',async (req,res)=>{
   const showAticle= await Article.findOne({_id:req.query.id},{keywords:1});
   const reg=new RegExp(showAticle.keywords,'i');
   let correAticle= await Article.find({
      $or : [ 
         {title: {$regex : reg}},
         {content: {$regex : reg}},
         {keywords: {$regex : reg}},
         {class: {$regex : reg}}
     ],verify:true
   },{_id:1,title:1,cover:1}).sort('-publishDate').limit(6);
   if(correAticle.length<6){
      const num=6-correAticle.length;     
      temAtc=await Article.find({class:showAticle.class},{_id:1,title:1,cover:1}).limit(num);
      correAticle= correAticle.concat(temAtc);
   }
   res.send(correAticle);
});


// 搜索页面模糊查询
home.get('/search',async(req,res)=>{
   let skips=(req.query.page-1)*7;
   const keywords=req.query.keywords;
   const reg=new RegExp(keywords,'i');
   const count= await Article.countDocuments({ $or : [ 
      {title: {$regex : reg}},
      {content: {$regex : reg}},
      {keywords: {$regex : reg}},
      {class: {$regex : reg}},
  ],
  verify:true});

   const pramas=await Article.find({
      $or : [ //多条件，数组
         {title: {$regex : reg}},
         {content: {$regex : reg}},
         {keywords: {$regex : reg}},
         {class: {$regex : reg}},
     ],
     verify:true
   },{class:1,publishDate:1,cover:1,title:1,describe:1,love:1})
   .sort('-publishDate').populate('author',{username:1}).skip(skips).limit(7);
   res.send({pramas:pramas,total:count});
});
//轮播图
home.get('/slide',async (req,res)=>{
   const slideall=await Share.find({isTop:true},{path:1,_id:0}).limit(3);
   const friends=await Friend.find({},{describe:0,_id:0}).limit(7);
   res.send({slideall:slideall,friends:friends});
})

//栏目页路由
home.get('/special',async (req,res)=>{
   req.session.regnum=1
   let page=(req.query.page-1)*12;
   let classes=req.query.class;
   switch(req.query.class){
      case 'hot':
      classes='热点分析'
      break;
      case 'prose':
      classes='散文随记'
      break;
      case 'study':
      classes='学习心得'
      break;
      case 'history':
      classes='历史故事'
      break;
      case 'famous':
      classes='经典文章'
      break;
      case 'poem':
      classes='诗歌词曲'
      break;
      case 'words':
      classes='说文解字'
      break;
      case 'selected':
      classes='名家精选'
      break;
      case 'junior':
      classes='初中作文'
      break;
      case 'grade':
      classes='小学作文'
      break;
      case 'fullMarks':
      classes='满分作文'
      break;
      case 'saying':
      classes='名言警句'
      break;
      case 'sharing':
      classes='资源共享'
      break;

   }
    const count=await Article.countDocuments({class:classes,verify:true});
   const result=await Article.find({class:classes,verify:true},{title:1,describe:1,cover:1,publishDate:1})
   .sort('-publishDate').skip(page).limit(12).populate('author',{username:1,_id:0});
   res.send({result:result,total:count,colum:classes});
});

//个人中心头像实时预览
home.post('/preview',(req,res)=>{  
   const form=new formidable.IncomingForm();
   form.uploadDir=path.join(__dirname,'../','public','uploads','head');
   form.keepExtensions=true;
   form.parse(req,(err,fields,files)=>{
      if(files.picName.path==undefined){
         res.send('fail');
         return;
      }else{
         res.send(files.picName.path.split('public')[1]);
         return;
      }
       
   });
});
//文章封面实时预览
home.post('/preview-cover',(req,res)=>{  
   const form=new formidable.IncomingForm();
   form.uploadDir=path.join(__dirname,'../','public','uploads','cover');
   form.keepExtensions=true;
   form.parse(req,(err,fields,files)=>{
       res.send(files.picName.path.split('public')[1]);
   });
});
//个人资料修改
home.post('/filechange',async (req,res)=>{
   try{
      await validateUser2(req.body);
   }catch(e){
      res.send(e.message);
      return
   }
   await User.updateOne({_id:req.body.id},{
      username:req.body.username,
      email:req.body.email,
      head:req.body.head,
      mood:req.body.mood
   }).then(async ()=>{     
      const cookies= await User.findOne({_id:req.body.id},{password:0});
      res.send(cookies);     
      return;
   })
   .catch((err)=>{res.send(err);return});
});

//随机头像
home.get('/random',async (req,res)=>{
   const headArr=['\\uploads\\head\\cat-ear.jpg',
   '\\uploads\\head\\cat.jpg',
   '\\uploads\\head\\dog.jpg',
   '\\uploads\\head\\upload_012a79008ce2e84633559ecc16eca2a2.gif',
   '\\uploads\\head\\upload_4c8cc019f31b94f84a25418f7a659e77.gif',
   '\\uploads\\head\\upload_274b3419a809ff5009f88ffb1203d662.gif',
   '\\uploads\\head\\upload_13e6c27f99acc8ae1d78b5a510023335.gif',
   '\\uploads\\head\\upload_65aeeb70b0b2c866ec295edb46db52b5.gif',
   '\\uploads\\head\\upload_4497c3a66fcc5e9e0116a461d19a6bda.gif',
   '\\uploads\\head\\upload_8691b5abe113029e6896b3515a91a708.gif',
   '\\uploads\\head\\upload_9212b8d1b53648ccd94c6e2b02fb1dbb.gif',
   '\\uploads\\head\\upload_64083fb447bc747a26032f1a87618dcb.gif',
   '\\uploads\\head\\upload_c4807586f8dfe4238be1df532ce4c5d7.jpg',
   '\\uploads\\head\\upload_d266236ce8a13b17cd5361906793d786.gif',
];
  function randomPic(){
     return Math.floor(Math.random()*14);
  }
  let num=randomPic();
  const head=headArr[num];
  await User.updateOne({_id:req.query.id},{head:head});
  res.send(headArr[num]);
});

//数据展示
home.get('/model-num',async (req,res)=>{
   let praiseMode=0;
   const aticleArr=await Article.find({author:req.query.id},{love:1,_id:0});
   aticleArr.forEach((items,index)=>{
      praiseMode+=items.love
   });
   res.send({praiseMode:praiseMode,allAticle:aticleArr.length});
})
//文章上传
home.post('/articleup',(req,res)=>{
   const form=new formidable.IncomingForm();
   form.uploadDir=path.join(__dirname,'../','public','uploads','cover');
   form.keepExtensions=true;
   form.parse(req,async (err,fields,files)=>{
      fields.cover=files.cover.path.split('public')[1];
      if(fields.publishDate==''){
         fields.publishDate=Date.now();
      }
      await Article.create(fields).then(()=>{
         res.send('true');
         return;
      }).catch((err)=>{
         res.send(err.message)
         return;
      });

      
   });
});

//文章列表
home.get('/atclist-p',async (req,res)=>{
   let ski=(req.query.page-0-1)*12;
   const atctotal=await Article.countDocuments({author:req.query.id});
   const atcAll=await Article.find({author:req.query.id,verify:true},{title:1,publishDate:1,cover:1}).sort('-publishDate').skip(ski).limit(12);  
   res.send({total:atctotal,article:atcAll});
});

//文章删除
home.get('/frond-delet',async (req,res)=>{
   await Article.findOneAndDelete({_id:req.query.id}).then(()=>{
      res.send('操作成功！');
      return
   }).catch((err)=>{res.send(err);return});
});
//评论列表
home.get('/common-p',async (req,res)=>{
   let ski=(req.query.page-0-1)*10;
   const commtotal=await Comment.countDocuments({userId:req.query.id});
   const commAll=await Comment.find({userId:req.query.id}).sort('-time').skip(ski).limit(10).populate('atcId',{title:1});
   res.send({total:commtotal,common:commAll});
});
//评论删除
home.get('/frondcomm-delet',async (req,res)=>{
   console.log(req.query.id)
   await Comment.findOneAndDelete({_id:req.query.id}).then(()=>{res.send("操作成功！");return;})
   .catch((err)=>{res.send(err);return;});
});

//首页编辑rank
home.get('/rank',async(req,res)=>{
   const ranker=await User.find({},{head:1,username:1,count:1}).sort('-count').limit(6);
   res.send(ranker);
});
//他人页面路由
//数据展示
home.get('/model-num-o',async (req,res)=>{
   let praiseMode=0;
   const aticleArr=await Article.find({author:req.query.id},{love:1,_id:0});
   aticleArr.forEach((items,index)=>{
      praiseMode+=items.love
   });
   const userMessage=await User.findOne({_id:req.query.id},{head:1,username:1,mood:1});
   res.send({praiseMode:praiseMode,allAticle:aticleArr.length,userInfo2:userMessage});
});
// 匿名留言
home.get('/leave',async (req,res)=>{
   const leaveRes=await Leave.find({userId:req.query.id},{content:1}).sort('-time');
   res.send(leaveRes);
});
home.get('/leave-add',async (req,res)=>{
   const leavetotal=await Leave.countDocuments({userId:req.query.userId});
   if(leavetotal>500){
      res.send('留言已经上限了！')
      return
   }
   await Leave.create({content:req.query.prama,userId:req.query.userId});
    const leaveRes=await Leave.find({userId:req.query.userId},{content:1}).sort('-time');
   res.send(leaveRes);
});
home.get('/delet-leave',async (req,res)=>{
   await Leave.deleteOne({_id:req.query.id}).then(async ()=>{
      const leaveRes=await Leave.find({userId:req.query.userId},{content:1}).sort('-time');
      res.send(leaveRes);
      return;
   }).catch((err)=>{
      res.send('fail');
      return;
   })
});
//新闻通知区域
home.get('/notice',async (req,res)=>{
   const showatc=await Article.find({isTop:true,verify:true},{cover:1,title:1,publishDate:1})
   .populate('author',{username:1})
   .sort('-publishDate').limit(6);
   const noticeatc= await Article.find({notice:true},{title:1}).sort('-publishDate').limit(7);
   res.send({showatc:showatc,noticeatc:noticeatc});
});
//原创专区
home.get('/original',async (req,res)=>{
   const modelatc=await Article.find({isTop:false,original:true},{cover:1,title:1}).sort('-love').limit(2);
   const originalatc= await Article.find({isTop:false,original:true,verify:true},{describe:1,title:1}).sort('-publishDate').limit(6);
   res.send({modelatc:modelatc,originalatc:originalatc});
})


// 移动端路由：
//原创及排行推荐
home.get('/firstshow',async (req,res)=>{
   const showatc=await Article.find({original:true,verify:true},{cover:1,title:1,publishDate:1})
   .sort('-publishDate').limit(7);
   const modelatc=await Article.find({isTop:false,original:true,verify:true},{cover:1,title:1}).sort('-love').limit(7);
   const hateatc=await Article.find({isTop:false,verify:true},{cover:1,title:1}).sort('-hate').limit(7);
   const listatc=await Article.find({verify:true},{cover:1,title:1,describe:1,publishDate:1}).populate('author',{username:1}).sort('-publishDate').limit(7);
   res.send({showatc:showatc,hateatc:hateatc,modelatc:modelatc,listatc:listatc});
});
//首页更多文章
home.get('/firstshow-more',async (req,res)=>{
   let ski=(req.query.page-0-1)*7;
   const listatc=await Article.find({verify:true},{cover:1,title:1,describe:1,publishDate:1}).populate('author',{username:1}).sort('-publishDate').skip(ski).limit(7);
   res.send({listatc:listatc});
});

//mobile文章列表
home.get('/atclist-m',async (req,res)=>{
   let ski=(req.query.page-0-1)*12;
   const atctotal=await Article.countDocuments({author:req.query.id});
   const atcAll=await Article.find({author:req.query.id,verify:true},{title:1,publishDate:1,cover:1,describe:1,}).sort('-publishDate').skip(ski).limit(12);  
   res.send({total:atctotal,article:atcAll});
});

//moblie评论路由
// 评论路由
home.post('/comment-m',async (req,res)=>{
   const {content,atcId,userId}=req.body;
      await Comment.create({ content:content,atcId:atcId,userId:userId,time:new Date()})
      let comments= await Comment.find({atcId:atcId}).populate('userId',{head:1,username:1}).sort('-time');
    res.send({comments:comments})
   
});


module.exports=home;