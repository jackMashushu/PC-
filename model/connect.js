const mongoose=require('mongoose');
const config=require('config');
// mongoose.connect(`mongodb://${config.get('db.user')}:${config.get('db.pwd')}@${config.get('db.host')}:${config.get('db.port')}/${config.get('db.name')}`,{useNewUrlParser: true,useUnifiedTopology: true})
mongoose.connect('mongodb://localhost/blog',{useNewUrlParser: true,useUnifiedTopology: true})
.then(()=>{console.log('数据库链接成功！')})
.catch(()=>{console.log('数据库链接失败')});