//Initializtion
var express = require('express')
var bodyParser = require('body-parser')
var mysql = require("mysql");
var app = express();
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "travel_website"
});
var config = require('./config')
var jwt = require('jsonwebtoken')
var md5 = require("md5")

//DB Setting
con.connect(function(err) {
    if (err) {
        console.log('connecting error');
        return;
    }
    console.log('connecting success');
});

app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.set('secret', config.secret)

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


//API Routing
var api = express.Router()
// TODO: authenticate
// TODO: verify token



api.post("/post_message",(req,res)=>{

  let sql = "INSERT INTO message (name,email,message) VALUES ('"+req.body.name+"', '"+req.body.email+"', '"+req.body.message+"')";
  
  con.query(sql, function(err,results) {
  if (err) throw err;
  res.send({status:"OK"})
  });

})

api.post("/create_user",(req,res)=>{
  let pw = req.body.password
  console.log(req.body)
  let sql = "INSERT INTO users (username,email,password) VALUES ('"+req.body.username+"', '"+req.body.email+"', '"+md5(pw)+"')";
  con.query(sql, function(err,results) {
  if (err) throw err;
  res.json({
              success: true,
              message: 'Created account!',
        })
  });

})

api.post('/authenticate', function (req, res) {
  console.log(req)
  let sql = (req.body.username == undefined)? "SELECT * from users where email = '"+req.body.email+"'" : "SELECT * from users where username = '"+req.body.username+"'"
  console.log(sql)
  con.query(sql,function(error, rows, fields){
    //檢查是否有錯誤
    if(error) throw error
    if(!rows){
      res.json({ success: false, message: 'Authenticate failed. User not found'})
    }  else if (rows){
          console.log(rows[0].password != md5(req.body.password))
          if(rows[0].password != md5(req.body.password)){
            res.json({ success: false, message: 'Authenticate failed. Wrong password'})
          }else {
            console.log(JSON.parse(JSON.stringify(rows[0])))
            var token = jwt.sign(JSON.parse(JSON.stringify(rows[0])), app.get('secret'), {
            expiresIn: 60*60
            })

            res.json({
              success: true,
              message: 'Enjoy your token',
              email:rows[0].email,
              token: token
        })
      }
    }
  })

});
//Check token middleware
api.use(function (req, res, next) {
  console.log(req.body)
  var token = req.body.token || req.query.token || req.headers['x-access-token']
  if (token) {
    jwt.verify(token, app.get('secret'), function (err, decoded) {
      if (err) {
        return res.json({success: false, message: 'Failed to authenticate token.'})
      } else {
        req.decoded = decoded
        next()
      }
    })
  } else {
    return res.status(403).send({
      success: false,
      message: 'No token provided.'
    })
  }
})

//Others API

api.post("/user_favourite",(req,res)=>{

  let sql = (req.body.username == undefined)? "SELECT * from users where email ='"+req.body.email+"'" : "SELECT * from users where username ='"+req.body.username+"'"
  con.query(sql,function(error, rows, fields){
    //檢查是否有錯誤
    if(error){
        throw error;
        res.send({'status':'ERROR'});
    }
    let sql = "select * from favourite where user = "+rows[0].id;
    con.query(sql, function(err,results) {
    if (err) throw err;
    res.send({
              results:results,
              success:true
        })
    });

});
})

api.post("/del_favourite",(req,res)=>{
  let id = ""
  let sql = "DELETE FROM favourite WHERE id = "+req.body.fav_id
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.json({"success":true,"message":"The favourite has been deleted!"})
  });
})

api.post("/favourite",(req,res)=>{
  console.log(req.body)
  let sql = (req.body.username == undefined)? "SELECT * from users where email ='"+req.body.email+"'" : "SELECT * from users where username ='"+req.body.username+"'"
  con.query(sql,function(error, rows, fields){
    //檢查是否有錯誤
    if(error){
        throw error;
        res.send({'status':'ERROR'});
    }
    let sql = "INSERT INTO favourite (content,user,imageurl) VALUES ('"+req.body.content+"', '"+rows[0].id+"', '"+req.body.url+"')";
    con.query(sql, function(err,results) {
    if (err) throw err;
    res.json({
              success: true,
              message: 'favourited!',
        })
    });

});

})

api.get("/",(req,res)=>{
  res.send('Hi, The API is at http://localhost:3000/api')
})

api.get('/users', function (req, res) {
  con.query('SELECT * from users',function(error, rows, fields){
    //檢查是否有錯誤
    if(error){
        throw error;
        res.send({'status':'ERROR'});
    }
    res.send({"results":rows});
});
})

api.post('/find_users', function (req, res) {
  let sql = (req.body.username == undefined)? "SELECT * from users where email ='"+req.body.email+"'" : "SELECT * from users where username ='"+req.body.username+"'"
  con.query(sql,function(error, rows, fields){
    //檢查是否有錯誤
    if(error){
        throw error;
        res.send({'status':'ERROR'});
    }
    res.send({"results":rows,"id":rows[0].id});
});
})


app.use('/api', api);



//Listening port
var server = app.listen(3000, function() {
   console.log('listening on port %d', server.address().port);
});



// var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
// var mongodbHost = 'ds127139.mlab.com';
// var mongodbPort = '27139';
// var authenticate = 'msim1718:msimDEV1718';
// var mongodbDatabase = 'hsmc_lollogin';
// var url = 'mongodb://'+authenticate+"@"+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase
// var bodyParser = require('body-parser')
// app.use( bodyParser.json() );
// app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
//   extended: true
// })); 
// mongoose.Promise = Promise;
// mongoose.connect(url);

// console.log(url);

// const router = express.Router();

// ////
// const schema = new mongoose.Schema(
//   {
//     username: { type: String, required: true },
//     password: { type: String, required: true },

//   },
//   { timestamps: true }
// );
// var User = mongoose.model("User",schema);
// //



// app.get('/hello', function(req, res){
//    res.send('hello world')
// });

// app.post("/test",(req,res)=>{
// 	console.log(req.body);
// 	res.send("finish")
// })

// app.post('/createUser',(req,res) =>{
// 	console.log(req.body);

// 	var newUser = new User({
//     	username: req.body.username,
//     	password: req.body.password,
//   	});
//   	console.log(newUser);
//   	newUser.save()
//   	.catch(error=>console.log(error));

// 	res.send({status:"Successful"})
// })

// const createUser = ({data}) => {
//   // console.log(credentials);
//   var newUser = new User({
//     username: data.username,
//     password: data.password,
//   });
//   console.log(newUser);
//   newUser.save()
//     .catch(error=>console.log(error));
// }

// var server = app.listen(3000, function() {
//    console.log('listening on port %d', server.address().port);
// });

// router.post('/signUp', (req, res) => {
//     //dummy api for testing
//     const { credentials } = req.body;
//     var newUser = new User({
//       type: credentials.type,
//       email: credentials.email
//     });
//     newUser.setPassword(credentials.password);
//     newUser.save()
//       .then(() => {
//         if (newUser.type === "parent") {
//           createParent({credentials, userid : newUser._id});
//         } else  {
//           createProvider({credentials, userid: newUser._id});
//         }
//         res.json({user:newUser.toAuthJSON()});
//       })


//       .catch(err=>res.status(400).json({errors: { header: "Sign Up Failed", content: err.errors[Object.keys(err.errors)[0]].message}}))

// });

// 运行:

// node app

// var MongoClient = require('mongodb').MongoClient;
// var assert = require('assert');
 
// var cloud = true;
 
// var mongodbHost = '127.0.0.1';
// var mongodbPort = '27017';
 
// var authenticate ='';
// //cloud
// if (cloud) {
 // mongodbHost = 'ds127139.mlab.com';
 // mongodbPort = '27139';
 // authenticate = 'FergusL:Fergus718817'
// }
 
// var mongodbDatabase = 'world';
 
// // connect string for mongodb server running locally, connecting to a database called test
// var url = 'mongodb://'+authenticate+mongodbHost+':'+mongodbPort + '/' + mongodbDatabase;
 
 
// // find and CRUD: http://mongodb.github.io/node-mongodb-native/2.0/tutorials/crud_operations/
// // aggregation: http://mongodb.github.io/node-mongodb-native/2.0/tutorials/aggregation/
 
// MongoClient.connect(url, function(err, db) {
//    assert.equal(null, err);
//    console.log("Connected correctly to server.");
// //var cursor = collection.find({});
//     // find top 20 countries by  size
//     db.collection('countries').find({},{"sort": [["area",-1]]}).limit(20).toArray(function(err, results){
//     console.log("Country One " +JSON.stringify(results[0])); 
//     console.log("Name of Country Four " +results[3].name+ " and size: " +results[3].area);
 
//       db.close();
//       console.log("Connection to database is closed.");
//     });
 
// }) //connect()