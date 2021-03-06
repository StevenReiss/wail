/********************************************************************************/
/*										*/
/*		sqlinjectionlesson.js						*/
/*										*/
/*	Implementation of sqlinjection lessons					*/
/*										*/
/********************************************************************************/



/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const db = require("./database.js");
const LessonBase = require("./lessonbase.js").LessonBase;



/********************************************************************************/
/*										*/
/*	Main class definition							*/
/*										*/
/********************************************************************************/

class SqlInjectionLesson extends LessonBase {

   constructor(name,id) {
      super(name,id);
    }

   localInitializeLesson(next) { initialize(this,next); } 
   
   doAction(req,res,act) {
      if (act == 'attempt') {
	 handleAttempt(req,res,this);
       }
      else if (act == 'done') {
	 handleDone(req,res,this);
       }
    }

}	// end of class SqlInjectionLesson




/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query(`DROP TABLE IF EXISTS SqlLogin_${id}`,(e1,d1) => { initialize1(lesson,next,e1,d1); } );
}


function initialize1(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = `CREATE TABLE SqlLogin_${id}( `;
   cmd += " user character(32), ";
   cmd += " pwd character(32), ";
   cmd += " admin boolean";
   cmd += ");";
   db.query(cmd,(e1,d1) => { initialize2(lesson,next,e1,d1); } );
}


function initialize2(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = "INSERT INTO SqlLogin_" + id + " (user,pwd,admin) VALUES ";
   cmd += ' ( "spr", "fdajkfdajkd;fei4784m,v", true ), ';
   cmd += ' ( "user234", "mypasswordgoeshere", false ); ';
   db.query(cmd,(e1,d1) => { commandEnd(lesson,next,e1,d1); } );
}


function commandEnd(lesson,next,err,data)
{
   if (next != null) next();
}


/********************************************************************************/
/*										*/
/*	Action	methods 							*/
/*										*/
/********************************************************************************/

function handleAttempt(req,res,lesson)
{
   let u = req.body.user;
   let p = req.body.password;
   cmd = "SELECT * FROM SqlLogin_" + lesson.lesson_id;
   cmd += ` WHERE user = '${u}' AND pwd = '${p}'`;
   db.query(cmd, (e1,d1) => { handleAttempt1(req,res,lesson,cmd,e1,d1) ; });
}


function handleAttempt1(req,res,lesson,cmd,err,data)
{
   let rslt = { };
   if (err != null) {
      rslt = { login: false, status: 'ERROR', query: cmd, message: err.sqlMessage };
    }
   else if (data.rows.length == 1) {
      let row = data.rows[0];
      rslt = { login: true, status: "SUCCESS", user: row.user, password: row.pwd, admin: row.admin };
    }
   else if (data.rows.length == 0) {
      rslt = { login: false, status: "NONE", query: cmd, message: "No rows returned" };
    }
   else {
      rslt = { login: false, status: "TOOMANY", query: cmd, message: "Too many rows returned", rows: data.rows };
    }
   res.end(JSON.stringify(rslt));

   lesson.enterGrade(req,res,lesson.lesson_id);
}



function handleDone(req,res,lesson)
{
   res.redirect("/lessons");
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = SqlInjectionLesson;




/* end of sqlinjectionlesson.js */





