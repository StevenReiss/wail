/********************************************************************************/
/*										*/
/*		server.js							*/
/*										*/
/*	Main node.js server for CSCI1320 interactive lessons			*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const express = require('express');
const exphbs = require("express-handlebars");
const handlebars = exphbs.create( { defaultLayout : 'main'});
const bodyparser = require('body-parser');
const busboy = require('express-busboy');
const multer = require('multer');
const session = require('express-session');
const cookieparser = require('cookie-parser');
const errorhandler = require('errorhandler');
const logger = require('morgan');
const fileUpload = require('express-fileupload');
const favicons = require("connect-favicons");

const redis = require('redis');
const RedisStore = require('connect-redis')(session);
const redisClient = redis.createClient();
const uuid = require('node-uuid');

const config = require("./config");
const auth = require("./auth");
const db = require("./database");
const lessonbase = require("./lessonbase");
const admin = require("./admin");




/********************************************************************************/
/*										*/
/*	Setup Express								*/
/*										*/
/********************************************************************************/

function setup()
{
   const app = express();

   app.engine('handlebars', handlebars.engine);
   app.set('view engine','handlebars');
   app.use(logger('combined'));

   app.use(favicons(__dirname + config.STATIC));

   app.use('/static',express.static(__dirname + config.STATIC));
   app.get('/robots.txt',(req,res) => { res.redirect('/static/robots.txt')});

   const upload = multer( { dest:  __dirname + '/files'});
   const bparse = bodyparser.urlencode({ extended : false} );
   const bparsej = bodyparser.json();
   // app.use(cookieparser(config.SESSION_KEY));
   // app.use(bodyparser.urlencoded({ extended : false}));

   app.use(session( { secret : config.SESSION_KEY,
		store : new RedisStore({ client: redisClient }),
		saveUninitialized : true,
		resave : true }));
   app.use(sessionManager);

   // general calls
   app.get("/",displayRootPage);
   app.get("/home",displayHomePage);
   app.get("/index",displayHomePage);

   app.post("/login",bparsej,auth.handleLogin);
   app.use(auth.authenticate);

   app.all("/lessons",displayLessonsPage);
   app.all("/lesson/:lessonid/page",lessonbase.handlePage);

   let up1 = upload.fields([ { name: 'htmlcssfile', maxCount: 1 },
		{ name: 'webfile2', maxCount: 20 } ,
		{ name: 'design1file', maxCount: 1 },
		{ name: 'design2file', maxCount: 1 },
		{ name: 'design3file', maxCount: 1 },
	]);

   app.post("/lesson/:lessonid/action/:action",upload.any(),lessonbase.handleAction);
   app.get("/lesson/:lessonid/action/:action",upload.none(),lessonbase.handleAction);

   app.get("/admin/home",admin.displayAdminPage);
   app.post("/admin/action/:action",upload.any(),admin.handleAdminAction);

   app.all('*',handle404);
   app.use(errorHandler);

   const server = app.listen(config.PORT);
   console.log("Listening on port " + config.PORT);
}


function action(name)
{
	return (req,res,next) => { req.params.action = name; lessonbase.handleAction(req,res,next); };
}

/********************************************************************************/
/*										*/
/*	Basic Page routines							*/
/*										*/
/********************************************************************************/

function displayRootPage(req,res)
{
	if (req.session.user == null) displayHomePage(req,res);
	else displayLessonsPage(req,res);
}



function displayHomePage(req,res)
{
   let rdata = { title: "WAIL Home Page"};
   if (req.session != null && req.session.user != null) {
      req.user = req.session.user;
      rdata.user = req.session.user;
    }
   res.render('home',rdata);
}



/********************************************************************************/
/*										*/
/*	Lessons page								*/
/*										*/
/********************************************************************************/

function displayLessonsPage(req,res)
{
   db.query("SELECT * FROM lessons ORDER BY active,number",(e1,d1) => { displayLessonsPage1(req,res,e1,d1) } );
}



function displayLessonsPage1(req,res,err,data)
{
   let rdata = { title: "WAIL Lessons Page"};
   rdata.lessons = data.rows;
   rdata.user = req.session.user;

   for (lesson of rdata.lessons) {
	   if (lesson.enabled) lesson.enabled = true;
	   else lesson.enabled = false;
	   lesson.url = '/lesson/' + lesson.id + "/page";
   }

   console.log("SHOW",rdata);
   res.render('lessons',rdata);
}




/********************************************************************************/
/*										*/
/*	Session management							*/
/*										*/
/********************************************************************************/

function sessionManager(req,res,next)
{
   if (req.session.uuid == null) {
      req.session.uuid = uuid.v1();
      req.session.save();
   }
   next();
}



/********************************************************************************/
/*										*/
/*	Error handling								*/
/*										*/
/********************************************************************************/

function handle404(req,res)
{
   res.status(404);
   if (req.accepts('html')) {
      res.render('error404', { title: 'Page Not Found'});
   }
   else if (req.accepts('json')) {
      let rslt = { status : 'ERROR', reason: 'Invalid URL'} ;
      res.end(JSON.stringify(rslt));
   }
   else {
      res.type('txt').send('Not Found');
   }
}



function errorHandler(err,req,res,next)
{
   console.log("ERROR on request %s %s %s",req.method,req.url,err);
   console.log("STACK",err.stack);

   res.status(500);
   let msg = 'Server Error';
   if (req.accepts('html')) {
	res.render('error500', { title: 'Server error', reason: msg });
     }
     else if (req.accepts('json')) {
	let rslt = { status : 'ERROR' ,reason: msg} ;
	res.end(JSON.stringify(rslt));
     }
     else {
	res.type('txt').send('Server Error');
     }
}



/********************************************************************************/
/*										*/
/*	Main program								*/
/*										*/
/********************************************************************************/

lessonbase.setupLessons()
.then(setup())



/* end of server.js */
