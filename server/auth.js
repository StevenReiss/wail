/********************************************************************************/
/*										*/			
/*		auth.js 							*/
/*										*/
/*	Authentication methods for wail 					*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const config = require("./config");
const db = require("./database");




/********************************************************************************/
/*										*/
/*	Middleware								*/
/*										*/
/********************************************************************************/

function authenticate(req,res,next)
{
   if (req.session.user == null) {
      res.redirect("/home");
    }
   else {
      req.user = req.session.user;
      req.admin = req.session.admin;
      req.session.touch();
      next();
    }
}


function handleLogin(req,res)
{
   console.log("HANDLE LOGIN");

   let rslt = { }
   if (req.body.user == null || req.body.user == '') {
       rslt = { status : 'ERROR', message : "Id must be given" }
       res.end(JSON.stringify(rslt));
     }
   else {
      db.query("SELECT * FROM students WHERE bannerid = $1",
		  [req.body.user],
		  function (e1,d1) { handleLogin1(req,res,e1,d1); });
    }
}



function handleLogin1(req,res,err,data)
{
        console.log("HL!",err,data.rows);
   if (err) {
      let rslt = { status : "ERROR", message: "Database problem: " + err };
      res.end(JSON.stringify(rslt));
    }
   else if (data.rows.length == 1) {
      let row = data.rows[0];
      console.log("USER",row);
      req.admin = false;
      req.user = row;
      req.session.user = req.user;
      req.session.admin = req.admin;
      req.session.save();
      let rslt = { status : "OK", user: req.user };
      res.end(JSON.stringify(rslt));
    }
   else {
      db.query("SELECT * FROM admin WHERE id = $1", [req.body.user],
		  function (e1,d1) { handleLogin2(req,res,e1,d1); });
    }

}


function handleLogin2(req,res,err,data)
{
   if (err) {
      let rslt = { status : "ERROR", message: "Database problem: " + err };
      res.end(JSON.stringify(rslt));
    }
   else if (data.rows.length == 1) {
      var row = data.rows[0];
      console.log("ADMIN USER",row.password,req.body.password,req.body);
      if (req.body.password != row.password) {
	 let rslt = { status: "ERROR", message: "Bad password" };
	 res.end(JSON.stringify(rslt));
       }
      else {
	 req.admin = true;
	 req.user = { bannerid: "", name : req.body.user, admin : true };
	 req.session.user = req.user;
	 req.session.admin = req.admin;
         req.session.save();
         let rslt = { status : "ADMIN", user : req.user };
	 res.end(JSON.stringify(rslt));
       }
    }
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.authenticate = authenticate;
exports.handleLogin = handleLogin;




/* end of auth.js */





























































