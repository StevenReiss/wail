/********************************************************************************/
/*										*/
/*		usertestlesson.js						*/
/*										*/
/*	Implementation of usertest lessons					*/
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

class UserTestLesson extends LessonBase {

   constructor(name,id) {
	   super(name,id);
	   }

   initializeLesson(next) {
      initialize(this,() => { return super.initializeLesson(next); });
   }

   enableLesson(next) {
      enabler(this,() => { return super.enableLesson(next); });
   }

   disableLesson(next) {
	   super.disableLesson(next);
   }

   showLesson(req,res) {
      this.showPage(req,res,this.lesson_id + "lesson",{});
   }

   doAction(req,res,act) {
      if (act == 'newtest') {
	 handleNewTest(req,res,this);
       }
      else if (act == 'taketest') {
	 handleTakeTest(req,res,this);
       }
    }

}	// end of class UserTestLesson




/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(lesson,next)
{
   let id = lesson.lesson_id;
   if (!id.startsWith("usertest")) return commandEnd(id,next);

   db.query("DROP TABLE IF EXISTS UserTestTable_" + id,(e1,d1) => { initialize1(id,next,e1,d1); } );
}


function initialize1(id,next,err,data)
{
   let cmd = "CREATE TABLE UserTestTable_" + id + "( ";
   cmd += " project character(128), ";
   cmd += " starturl character(128), ";
   cmd += " task text, ";
   cmd += " questionurl character(128), ";
   cmd += " uses int DEFAULT 0";
   cmd += ");";
   db.query(cmd,(e1,d1) => { commandEnd(id,next,e1,d1); } );
}


function commandEnd(id,next,err,data)
{
   if (next != null) next();
}


function enabler(lesson,next)
{
   let id = lesson.lesson_id;    
   if (!id.startsWith("usertest")) return commandEnd(id,next);  

   db.query("DELETE FROM UserTestTable_" + id,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}


/********************************************************************************/
/*										*/
/*	Add a new test								*/
/*										*/
/********************************************************************************/

function handleNewTest(req,res,lesson)
{
   let id = lesson.lesson_id;

   db.pquery("DELETE FROM UserTestTable_" + id + " WHERE project = $1",[req.body.project])
      .then((d1) => handleNewTest1(req,res,lesson,d1) )
      .then((d1) => handleNewTest2(req,res,lesson,d1) );
}


function handleNewTest1(req,res,lesson,data)
{
    let start = config.htmlSanitize(req.body.starturl);
    let task = config.htmlSanitize(req.body.task);
    let question = config.htmlSanitize(req.body.questionurl);

    let cmd = "INSERT INTO UserTestTable_" + id + "(project,starturl,task,questionurl) VALUES($1,$2,$3,$4)";
    return db.pquery(cmd,[req.body.project,start,task,question] ,
			(e1,d1) => { handleNewTest2(req,res,id,e1,d1); });
}


function handleNewTest2(req,res,id,err,data)
{
    res.redirect('/lessons');
}



/********************************************************************************/
/*										*/
/*	Take a test								*/
/*										*/
/********************************************************************************/

function handleTakeTest(req,res,lesson)
{
   let id = lesson.lesson_id;

   db.pquery("SELECT * FROM UserTestTable_" + id + " WHERE project != $1 ORDER BY uses",
	       [req.body.project])
      .then( (d1) => handleTakeTest1(req,res,lesson,d1) );
}


function handleTakeTest1(req,res,lesson,data)
{
   let ln = data.rows.length;
   let use = -1;
   for (let i = 0; i < ln; ++i) {
      if (use == -1) use = data.row[i].uses;
      else if (data.row[i].uses > use) {
	 ln = i;				
	 break;
       }
    }

   let rdata= { };
   let page = 'shownotest';
   if (ln == 0) {
      rdata = { status: false };
    }
   else {
      page = 'showusertest';
      db.query("UPDATE DesignTable_" + lesson.lesson_id +
		  " SET uses = $1 WHERE bannerid = $2",[use+1,row[idx].banerid]);
      let idx = Math.floor(Math.random() * ln);
      rdata = { status: true,
		project : row[idx].project,
		starturl : row[idx].starturl,
		task : row[idx].task,
		questionurl : row[idx].questionurl };
    }

   lesson.showPage(req,res,page,rdata);
}




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = UserTestLesson;




/* end of usertestlesson.js */
