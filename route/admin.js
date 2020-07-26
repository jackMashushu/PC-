const express=require('express');
const path=require('path');
const admin=express.Router();  
const joi=require('joi');
const {Comment,Leave}=require('../model/comment');
const {User,validateUser}=require('../model/user');
const {Article,Share,Friend}=require('../model/article');
const formidable=require('formidable');
const pagination=require('mongoose-sex-page');


admin.get('/login',(req,res)=>{
   res.render('admin/login');
});
admin.post('/login',async (req,res)=>{
   //二次验证用户账号密码
   const{email,password}=req.body;
   let user=await User.findOne({email:email});
   if(user){
      if(password==user.password){
         req.session.username=user.username;  
         req.session.identity=user.identity;
         req.app.locals.userInfo=user;
         let cookies=user;
         cookies.password='';
         let flag=false;
         if(user.identity=='admin'){flag=true};
         if(user.identity=='normal'){flag=false};
         res.send({flag:flag,cookies:cookies});   
      }else{
         res.send('fail');//如果登陆失败，在直接返回false
      }
   }else{
      res.end('fail');
   }  
});


admin.get('/userEdit',async (req,res)=>{
   req.app.locals.currentLink='userEdit';
   let userCount=await User.countDocuments();
   let atcCount=await Article.countDocuments();
   res.render('admin/userEdit',{
      userID:req.session.username,
      userCount:userCount,
      atcCount:atcCount
   });
});
admin.get('/logout',(req,res)=>{
   req.session.destroy(function(){
      res.clearCookie('connect.sid');
      res.redirect('/admins/login');
      req.app.locals.userInfo=null;
   })
});
//用户列表页模板渲染路由
admin.get('/userMannage',(req,res)=>{
   req.app.locals.currentLink='userMannage';//已经忘了这个代码的作用
   //只需要给个模板就行了，列表渲染用字符串拼接
   res.render('admin/userMannage');

});
admin.get('/userAdd',async (req,res)=>{
   const{message,id}=req.query;
   if(id){
      const blank=await User.findOne({_id:id});
      res.render('admin/userAdd',{
         blank:blank,
         message:message,
         path:'/admins/userChange?id='+id,//这里需要在地址栏传递id信息供服务器确定修改的哪条数据
         button:'确认修改'
      });
      return
   }else{

   }
   res.render('admin/userAdd',{
      message:message,
      path:'/admins/userAdd',
      button:'确认添加'
   })
});
admin.post('/userAdd',(req,res,next)=>{
   const userForm=new formidable.IncomingForm();
   userForm.uploadDir=path.join(__dirname,'../','public','uploads','head');
   userForm.keepExtensions=true;
   userForm.parse(req,async (err,fields,files)=>{
      
   // 这里validateUser引入的是user.js里的验证函数
   try{
      await validateUser(fields);
   }catch(e){
      // 验证没通过可以重定向到当前页面，并在地址栏拼接错误信息，把错误信息获取后渲染到模板相关位置即可，e.message是错误信息
      return next(JSON.stringify({path:'/admins/userAdd',message:e.message}));
   }
   let userTest=await User.findOne({email:fields.email});
   if(userTest){
      return next(JSON.stringify({path:'/admins/userAdd',message:'邮箱地址被占用'}));
   }else{
      User.create({
         username:fields.username,
         email:fields.email,
         password:fields.password,
         head:files.head.path.split('public')[1],
         identity:fields.identity
       }).then(()=>{
         next(JSON.stringify({path:'/admins/userAdd',message:'操作成功'}));
         });
   }
});   
});

// 用户列表分页器路由
admin.get('/toltal',async (req,res)=>{
   const {page}=req.query;
   const repage=(page-1)*12;
   let count=await User.countDocuments();
   const allth=await User.find().sort('-_id').skip(repage).limit(12);
   res.send({total:count,result:allth});
});
//总文章列表分页器路由
admin.get('/article-list',async (req,res)=>{
   const {page}=req.query;
   const repage=(page-1)*12;
   let count=await Article.countDocuments();
   const allarticle=await Article.find().sort('-publishDate').skip(repage).limit(12).populate('author');
   res.send({total:count,result:allarticle});
})

//修改用户数据
admin.post('/userChange',async (req,res)=>{
   const userForm=new formidable.IncomingForm();
   userForm.uploadDir=path.join(__dirname,'../','public','uploads','head');
   userForm.keepExtensions=true;
   userForm.parse(req,async (err,fields,files)=>{
   // let body=req.body;
   const getData=req.query.id;//用户id信息是拼接在地址栏传输的
   await User.updateOne({_id:getData},{     
         username:fields.username,
         email:fields.email,
         password:fields.password,
         head:files.head.path.split('public')[1],
         identity:fields.identity      
   });
   res.redirect('/admins/userMannage');
   });
});

//删除用户
admin.get('/delet-data',async (req,res)=>{
   await User.deleteOne({_id:req.query.id});
   res.end();
});
//文章列表页基础模板
admin.get('/articleMan',(req,res)=>{
   req.app.locals.currentLink='articleMan';   
   res.render('admin/articleMan');
});
admin.get('/contentMan',(req,res)=>{
   req.app.locals.currentLink='contentMan';
   res.render('admin/contentMan');
});
admin.post('/article-add',(req,res)=>{
   const form=new formidable.IncomingForm();
   //配置上传文件的存放位置，文件会被默认放在这个文件夹，cover中仅仅存放地址，和普通数据一起放入数据库
   form.uploadDir=path.join(__dirname,'../','public','uploads');
   //是否保留默认的文件后缀
   form.keepExtensions=true;
   //解析表单
   form.parse(req,(err,fields,files)=>{
      if(fields.publishDate==''){
         fields.publishDate=Date.now();
      }
     let describe=fields.content.replace(/<[^>]+>/g,"").substr(0,200);
     if (fields.verify-0){fields.verify=true}else{fields.verify=false}
     if (fields.notice-0){fields.notice=true}else{fields.notice=false}
     if (fields.original-0){fields.original=true}else{fields.original=false}
     if (fields.isTop-0){fields.isTop=true}else{fields.isTop=false}
    Article.create({
      title:fields.title,
      author:fields.author,
      publishDate:fields.publishDate,
      cover:files.cover.path.split('public')[1],
      content:fields.content,
      class:fields.class,
      keywords:fields.keywords,
      verify:fields.verify,
      notice:fields.notice,
      describe:describe,
      original:fields.original,
      isTop:fields.isTop
    });
    res.redirect('/admins/contentMan');
   });  
});
admin.get('/delet-article',async (req,res)=>{
 await Article.findOneAndDelete({_id:req.query.id});
 res.redirect('/admins/articleMan')
});
admin.get('/article-add',async (req,res)=>{
   const articleDetail=await Article.findOne({_id:req.query.id});
   res.render('admin/contentMan',{
      id:req.query.id,
      articleDetail:articleDetail
   });
});
admin.post('/article-change',async (req,res)=>{
   const form=new formidable.IncomingForm();
   form.uploadDir=path.join(__dirname,'../','public','uploads');
   form.keepExtensions=true;
   const id=req.query.id//注意这里的id是通过地址栏传输过来的，所以body里面没有
   form.parse(req,(err,fields,files)=>{
      if(fields.publishDate==''){
         fields.publishDate=Date.now();
      }
      let describe=fields.content.replace(/<[^>]+>/g,"").substr(0,200);
      if (fields.verify-0){fields.verify=true}else{fields.verify=false}
      if (fields.notice-0){fields.notice=true}else{fields.notice=false}
      if (fields.original-0){fields.original=true}else{fields.original=false}
      if (fields.isTop-0){fields.isTop=true}else{fields.isTop=false}

      Article.updateOne({_id:id},{
         title:fields.title,
         author:fields.author,
         publishDate:fields.publishDate,
         cover:files.cover.path.split('public')[1],
         content:fields.content,
         class:fields.class,
         keywords:fields.keywords,
         verify:fields.verify,
         notice:fields.notice,
         describe:describe,
         original:fields.original,
         isTop:fields.isTop
      }).then((res)=>{console.log(res)});
   });  
   res.redirect('/admins/articleMan');
});
//生成作者文章总数
admin.get('/rankUp',async (req,res)=>{
   req.app.locals.currentLink='rankUp';
   res.render('admin/rankUp')
});
admin.get('/rankUpdate',async (req,res)=>{
   const allAuthor=await User.find({});
   allAuthor.forEach(async (items,index)=>{
      const atcCount=await (await Article.find({author:items._id})).length;
      await User.updateOne({_id:items._id},{count:atcCount});      
   });
   res.send('更新成功，请不要反复生成！');   
});
//文章审核
admin.get('/verify',async (req,res)=>{
   req.app.locals.currentLink='verify';
   res.render('admin/verify')
});
admin.post('/verify',async (req,res)=>{
   const {page}=req.body;
   const repage=(page-1)*12;
   let count=await Article.countDocuments({verify:false});
   const allarticle=await Article.find({verify:false},{title:1,author:1})
   .sort('-publishDate').skip(repage).limit(12).populate('author',{username:1});
   res.send({total:count,result:allarticle});
});

//文章审核预览
admin.get('/verify-pre',async (req,res)=>{
   const atc=await Article.findOne({_id:req.query.id},{title:1,publishDate:1,cover:1,content:1});
   res.send(atc)
});
//审核中删除
admin.get('/notpass',async (req,res)=>{
   await Article.findOneAndDelete({_id:req.query.id})
   .then(()=>{res.send('bingo');return;})
   .catch((err)=>{res.send(err);return;});
});
//通过审核
admin.get('/pass',async (req,res)=>{
   await Article.updateOne({_id:req.query.id},{verify:true})
   .then(()=>{res.send('bingo');return})
   .catch((err)=>{res.send(err);return});
});
// 评论类容管理
admin.get('/commentMan',(req,res)=>{
   req.app.locals.currentLink='commentMan';
   res.render('admin/comment');
});
admin.post('/commentMan', async (req,res)=>{
   const {page}=req.body;
   const repage=(page-1)*12;
   let count=await Comment.countDocuments({isRead:false});
   const allarticle=await Comment.find({isRead:false})
   .sort('-time').skip(repage).limit(12).populate('atcId',{title:1}).populate('userId',{username:1});
   res.send({total:count,result:allarticle});
});
admin.get('/comment-set',async(req,res)=>{
   if(req.query.type=='read'){
      await Comment.updateOne({_id:req.query.id},{isRead:true}).then(()=>{
         res.send('bingo')
         return;
      }).catch((err)=>{
         res.send('fail')
         return;
      })
   }else if(req.query.type=='delet'){
      await Comment.findOneAndDelete({_id:req.query.id}).then(()=>{
         res.send('bingo')
         return;
      }).catch((err)=>{
         res.send('fail')
         return;
      });
   }
});
//匿名评论管理
admin.post('/leaveMan',async (req,res)=>{
   const {page}=req.body;
   const repage=(page-1)*12;
   let count=await Leave.countDocuments({isRead:false});
   const allarticle=await Leave.find({isRead:false})
   .sort('-time').skip(repage).limit(12).populate('userId',{username:1});
   res.send({total:count,result:allarticle});
});
admin.get('/leave-set',async(req,res)=>{
   if(req.query.type=='read'){
      await Leave.updateOne({_id:req.query.id},{isRead:true}).then(()=>{
         res.send('bingo')
         return;
      }).catch((err)=>{
         res.send('fail')
         return;
      });
   }else if(req.query.type=='delet'){
      await Leave.findOneAndDelete({_id:req.query.id}).then(()=>{
         res.send('bingo')
         return;
      }).catch((err)=>{
         res.send('fail')
         return;
      })
   }
});
// 友链新增
admin.get('/friend',(req,res)=>{
   req.app.locals.currentLink='friend';
   res.render('admin/friend');
});
admin.get('/friend-set',async(req,res)=>{
   if(req.query.type=='add'){
      await Friend.create({
         keywords:req.query.keywords,
         path:req.query.friUrl,
         describe:req.query.describes
      }).then(()=>{res.send('bingo');return;})
      .catch((err)=>{res.send(err);return;})
   }else if(req.query.type=='get'){
     const prama= await Friend.find({},{describe:0});
     res.send(prama);return;
   }else if(req.query.type=='delet'){
     await Friend.findOneAndDelete({_id:req.query.id}).then(()=>{
        res.send('bingo');return;
     }).catch((err)=>{
        res.send(err);return;
     });
   }
});



// 轮播更换
admin.get('/static',(req,res)=>{
   req.app.locals.currentLink='static';
   res.render('admin/static');
});
admin.post('/lunbo',async (req,res)=>{
   const form=new formidable.IncomingForm();
   form.uploadDir=path.join(__dirname,'../','public','uploads','slide');
   form.keepExtensions=true;
   form.parse(req,async (err,fields,files)=>{
      await Share.create({path:files.picName.path.split('public')[1]}).then(()=>{
         res.send(files.picName.path.split('public')[1]);
         return;
      }).catch((err)=>{
         res.send('fail');
         return;
      })
      
   });

});

admin.get('/lunboall',async (req,res)=>{
   if(req.query.type==undefined){
      const all=await Share.find({}).sort('-isTop');
      res.send(all);
      return;
   }else if(req.query.type=='clear'){
      await Share.deleteMany({}).then(()=>{
         res.send('bingo');return;
      }).catch((err)=>{res.send('fail');return;})
      
   }

});
admin.get('/lunbo-set',async (req,res)=>{
   if(req.query.type=='update'){
      const count=await Share.countDocuments({isTop:true});
      if(count==3||count>3){
         res.send('最多展示三张！');
         return;
      }else if(count<3){
         await Share.updateOne({_id:req.query.id},{isTop:true}).then(()=>{
            res.send('bingo');return;
         }).catch((err)=>{res.send('fail');return;});
      }
   }else if(req.query.type=='down'){
      await Share.updateOne({_id:req.query.id},{isTop:false}).then(()=>{
         res.send('bingo');return;
      }).catch((err)=>{res.send('fail');return;});
   }else if(req.query.type=='delet'){
      await Share.findOneAndDelete({_id:req.query.id})
      .then(()=>{res.send('bingo');return;}).catch((err)=>{
         res.send('fail');return;
      })
   }
});


module.exports=admin;