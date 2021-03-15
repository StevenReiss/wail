/********************************************************************************/
/*										*/
/*		lessonbase.js							*/
/*										*/
/*	Base class for all lessons						*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const db = require("./database.js");


/********************************************************************************/
/*										*/
/*	Global variables							*/
/*										*/
/********************************************************************************/

let lessons = { };


/********************************************************************************/
/*										*/
/*	Class definition							*/
/*										*/
/********************************************************************************/


class LessonBase {

	constructor(name,id) {
	    this.lesson_name = name;
	    this.lesson_id = id;
	}

	initializeLesson(next) {
		this.localInitializeLesson(() => {
			db.query("UPDATE lessons SET inited = true WHERE name = $1",[this.lesson_name],
				(e1,d1) => { doNext(next) } ); } );
	}

	enableLesson(next) {
		this.localEnableLesson( () => {
		      db.query("UPDATE lessons SET enabled = true WHERE name = $1",[this.lesson_name],
			(e1,d1) => { doNext(next) } );
		});
	}

	resetLesson(next) {
		this.localResetLesson( () => {
		      db.query("UPDATE lessons SET enabled = true WHERE name = $1",[this.lesson_name],
			(e1,d1) => { doNext(next) } );
		});
	}

       disableLesson(next) {
		this.localDisableLesson( () => {
		      db.query("UPDATE lessons SET enabled = false WHERE name = $1",[this.lesson_name],
			(e1,d1) => { doNext(next) } );
		});
	}

	setActiveDate(date,next) {
	    db.query("UPDATE lessons SET active = $1 WHERE NAME = $2",[date,this.lesson_name],
	    (e1,d1) => { doNext(next); } );
	}

	localInitializeLesson(next) { doNext(next); }
	localEnableLesson(next) { doNext(next); }
	locatResetLesson(next) { doNext(next); }
	localDisableLesson(next) { doNext(next); }

	showLesson(req,res,data) {
	   if (data == null) {
	      this.localGetLessonParameters(req,res,
		  (req,res,data) => { this.showPage(req,res,this.lesson_id + "lesson", data); } );
	   }
	   else {
	      this.showPage(req,res,this.lesson_id + "lesson",data)
	   }
	}

	localGetLessonParameters(req,res,next) {
	   if (next != null) next(req,res,{ });
	}

	doAction(res,req,act) { }

	// HELPER METHODS

	showPage(req,res,id,rdata) {
	   if (rdata == null) rdata = { };
	   if (rdata.lesson_id == null) rdata.lesson_id = this.lesson_id;
	   rdata.lesson_name = this.lesson_name;
	   rdata.user = req.session.user;
	   console.log("USE",rdata);
	   res.render(id,rdata);
	}

	enterGrade(req,res,what,next) {
	   if (what instanceof Function) {
		next = what;
		what = this.lesson_id;
	   }

	   setLessonGrade(req,res,this,what,next);
	}

}	// end of class LessonBase



/********************************************************************************/
/*										*/
/*	Request handling methods						*/
/*										*/
/********************************************************************************/

function handlePage(req,res)
{
	console.log(req.params);
    let id = req.params.lessonid;
    let lesson = lessons[id];
    if (lesson == null) res.redirect("/lessons");
    else {
       console.log(id,lesson,lessons);
       lesson.showLesson(req,res);
    }
}


function handleAction(req,res)
{
   let id = req.params.lessonid;
   let lesson = lessons[id];
   let act = req.params.action;
   console.log("ACTION",id,lesson,act);

   if (lesson == null) res.redirect("/lessons");
   else {
      lesson.doAction(req,res,act);
   }
}


function handleAdminAction(req,res)
{
   let id = req.body.lesson;
   let act = req.body.action;
   let lesson = lessons[id];
   console.log("ADMIN ACT",req);
   console.log("ADMINACTION",id,act,req.params.action);

   switch (act) {
	   case 'ENABLE' :
		   lesson.enableLesson(() => { handleAdminAction1(req,res); });
		   break;
	   case 'DISABLE' :
		   lesson.disableLesson( () => { handleAdminAction1(req,res); });
		   break;
	   case 'INITIALIZE' :
		   lesson.initializeLesson( () => { handleAdminAction1(req,res); } );
		   break;
	   case 'RESET' :
		   lesson.resetLesson(() => { handleAdminAction1(req,res); })
	   default :
	      res.redirect("/admin/home");
	      break;
   }
   lesson = lessons[id];
   console.log("ADMINACTIONDONE",lesson);
}


function handleAdminAction1(req,res)
{
   let date = req.params.activedate;
   if (date != null && date != '' && date != lesson.active) {
      lesson.setActiveDate( () => { handleAdminAction2(req,res); });
   }
   else handleAdminAction2(req,res);
}


function handleAdminAction2(req,res)
{
   res.redirect("/admin/home");
}



/********************************************************************************/
/*										*/
/*	Helper methods								*/
/*										*/
/********************************************************************************/

function doNext(next)
{
	if (next != null) next();
}


function setupLessons()
{
       return new Promise((res,rej) => { setupLessons0(res,rej); } );
}


function setupLessons0(next,reject)
{
   db.query("SELECT * from lessons order by number",(e1,d1) =>
       { setupLessons1(e1,d1,next); });
}


function setupLessons1(err,data,next,reject)
{
    if (err != null) {
	if (reject != null) reject(err);
	return;
    }

    for (let row of data.rows) {
       let mod = require('./' + row.module);
       let obj = new mod.Lesson(row.name,row.id,row);
       lessons[row.id] = obj;
    }

    if (next != null) next();
}



/********************************************************************************/
/*										*/
/*	Handle grades								*/
/*										*/
/********************************************************************************/

function setLessonGrade(req,res,lesson,what,next)
{
    db.query("DELETE FROM grades WHERE bannerid = $1 AND lesson = $2",
	[req.session.user.bannerid,what],
	(e1,d1) => { setLessonGrade1(req,res,lesson,what,next); });
}


function setLessonGrade1(req,res,lesson,what,next)
{
    db.query("INSERT INTO grades (bannerid,lesson) VALUES ($1,$2)",
	[req.session.user.bannerid,what],
	(e1,d1) => { setLessonGrade2(req,res,lesson,what,next); });
}


function setLessonGrade2(req,res,lesson,what,next)
{
    if (next != null) next(req,res);
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.LessonBase = LessonBase;
exports.handlePage = handlePage;
exports.handleAction = handleAction;
exports.handleAdminAction = handleAdminAction;
exports.setupLessons = setupLessons;



/* end of lessonbase.js */
