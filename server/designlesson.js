/********************************************************************************/
/*										*/
/*		designlesson.js 						*/
/*										*/
/*	Implementation of design lessons					*/
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

class DesignLesson extends LessonBase {

   constructor(name,id) {
	   super(name,id);
	   }

   initializeLesson(next) {
      initialize(this.lesson_id,() => { return super.initializeLesson(next); });
   }

   enableLesson(next) {
      enabler(this.lesson_id,() => { return super.enableLesson(next); });
   }

   disableLesson(next) {
	   super.disableLesson(next);
   }

   showLesson(req,res) {
      this.showPage(req,res,this.lesson_id + "lesson",{});
   }

   doAction(req,res,act) {
	   if (act == 'upload') {
	     handleUpload(req,res,this.lesson_id);
	   }
    }

}	// end of class DesignLesson




/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(id,next)
{
   db.query("DROP TABLE IF EXISTS DesignTable_" + id,(e1,d1) => { initialize1(id,next,e1,d1); } );
}


function initialize1(id,next,err,data)
{
   let cmd = "CREATE TABLE DesignTable_" + id + "( ";
   cmd += " bannerid character(16), ";
   cmd += " filename character(128), ";
   cmd += " uses int DEFAULT 0 "
   cmd += ");";
   db.query(cmd,(e1,d1) => { commandEnd(id,next,e1,d1); } );
}


function commandEnd(id,next,err,data)
{
   if (next != null) next();
}


function enabler(id,next)
{
   db.query("DELETE FROM DesignTable_" + id,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}


/********************************************************************************/
/*										*/
/*	Action	methods 							*/
/*										*/
/********************************************************************************/

function handleUpload(req,res,id)
{
   console.log("FILES",req.body,req.params,req.session.user,req.files);
   db.query("DELETE FROM DesignTable_" + id + " WHERE bannerid = $1",
                [req.session.user.bannerid],
	(e1,d1) => { handleUpload1(req,res,id,e1,d1); } );
}


function handleUpload1(req,res,id,err,data)
{
    let file = req.files.designfile.file;
    let bannerid = req.session.user.bannerid;
    let cmd = "INSERT INTO DesignTable_" + id + "(bannerid,filename) VALUES($1,$2)";
    db.query(cmd,[bannerid,file],(e1,d1) => { handleUpload2(req,res,id,e1,d1); });
}


function handleUpload2(req,res,id,err,data)
{
    res.redirect('/lessons');
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = DesignLesson;




/* end of designlesson.js */





