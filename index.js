const path = require('path')
const express = require('express')
const app = express()
const getPort = require('get-port')
const rp = require('request-promise')
const to = require('await-to-js').default
const ejs = require('ejs')
const c = require('child_process')

// const multer = require('multer')
// var upload = multer({
//   storage: multer.memoryStorage(),
//   fileFilter: function (req, file, cb) {
//     const fileType = file.originalname.split('.')[1].toLowerCase()
//     if (!['xlsx', 'xlc', 'xlm', 'xls', 'xlt', 'xlw', 'csv'].includes(fileType)) {
//       cb(new Error('文件格式错误'), false)
//     } else {
//       cb(null, true)
//     }
//   }
// })
// const requestOptions = {
//   json: true,
//   resolveWithFullResponse: false,
//   proxy: 'http://127.0.0.1:1088',
//   headers: {
//     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36',
//     'content-type': 'application/json; charset=utf-8',
//     'referer': 'https://www.instagram.com/',
//     'origin': 'https://www.instagram.com/'
//   }
// }

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
// app.use(upload.any())
const viewPath = path.join(__dirname, './views/')
// console.log('viewPath', viewPath)
app.set('views', viewPath)
app.set('view engine', 'ejs')

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Content-Type', 'text/html; charset=utf-8 ')
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,GET,DELETE,OPTIONS')
  // res.header('X-Powered-By', ' 4.16.4')
  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
  } else {
    next()
  }
})
app.get('/', (req, res) => {
  res.render('getPostInfo', {title:'获取Ins 帖子信息'})
})
app.get('/info',(req,res)=>{
  const {shortCode} =req.query
  const url = `https://www.instagram.com/p/${shortCode}/?__a=1`
  rp.get(url,requestOptions)
  .then(response=>{
    console.log('response', response)
    res.json(response)
  })
  .catch(err=>{
    console.log('err', err)
    res.json({
      code:400,
      message:'请求出错'
    })
  })
})
app.get('/api/testproxy',async (req,res)=>{
  console.log('/api/testproxy',req.query)
  const {url,port} = req.query
  const proxy = `http://${url}:${port}`
  const [err,res2] = await to(rp.get('https://www.instagram.com',{proxy}))
  if(res2&&!err){
    res.json({
      code:200
    })
    return
  }
  res.json({
    code:404
  })
})
app.get('/api/login',async (req,res)=>{
  console.log('/api/login',req.query)
  const {url,port,username,password,shortCode} = req.query
  const proxy = `http://${url}:${port}`
  const { IgApiClient } = require('instagram-private-api')
  const ig = new IgApiClient()
  ig.state.generateDevice(username)
  ig.state.proxyUrl = proxy
  let loggedInUser
  try {
    await ig.simulate.preLoginFlow()
    loggedInUser = await ig.account.login(username,password)
  } catch (error) {
    res.json({
      status:'failed',
      message:'登陆ins失败'
    })
    return
  }
  const {urlSegmentToInstagramId} =require('instagram-id-to-url-segment')
  const mediaId = urlSegmentToInstagramId(shortCode)
  const info = await ig.media.info(mediaId)
  await ig.account.logout()
  res.json(info)
})
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   console.log(err.message);
  
// });
app.get('/api/profile',async (req,res)=>{
  const {url,port,username,password,name} = req.query
  const proxy = `http://${url}:${port}`
  const { IgApiClient } = require('instagram-private-api')
  const ig = new IgApiClient()
  ig.state.generateDevice(username)
  ig.state.proxyUrl = proxy
  let loggedInUser
  try {
    await ig.simulate.preLoginFlow()
    loggedInUser = await ig.account.login(username,password)
  } catch (error) {
    console.log('error', error)
    res.json({
      status:'failed',
      message:'登陆ins失败'
    })
    return
  }
  const id = await ig.user.getIdByUsername(name)
  const info = await ig.user.info(id)
  if(!info.username){
    res.json({
      status:'failed',
      message:'获取profile失败'
    })
    return
  }
  res.json({
    status:'ok',
    info
  })
})
app.listen(3000,() => {
  console.log('App listening on port:3000 !')
  setTimeout(()=>{
    c.exec('open http://localhost:3000')
  },1000)
})
