const guard=(req,res,next)=>{
    if(req.url!='/login'&&!req.session.username){
        res.redirect('/admins/login');
    }else if(req.url!='/login'&&req.session.username&&!(req.session.identity=='admin')){
        res.redirect('/home/');
    }
    else{
        next()
    }
}
module.exports=guard;