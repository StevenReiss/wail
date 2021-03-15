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

   constructor(name,id,row) {
           super(name,id);
           this.crits_id = row.reference;
	   }

   localInitializeLesson(next) { initialize(this,next); }        
   localResetLesson(next) { clear(this,next); }

   doAction(req,res,act) {
	   if (act == 'upload') {
	     handleUpload(req,res,this);
           }
           else if (act == 'showfeedback') {
             handleShowFeedback(req,res,this);      
           }
    }

    localInitialize(next) {

    }

}	// end of class DesignLesson




/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query(`DROP TABLE IF EXISTS DesignTable_${id}`,
        (e1,d1) => { initialize1(lesson,next,e1,d1); } );
}


function initialize1(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = `CREATE TABLE DesignTable_${id}( `;
   cmd += " bannerid character(16), ";
   cmd += " filename character(128), ";
   cmd += " uses int DEFAULT 0 "
   cmd += ");";
   db.query(cmd,(e1,d1) => { commandEnd(lesson,next,e1,d1); } );
}


function commandEnd(lesson,next,err,data)
{
   if (next != null) next();
}


function clear(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query(`DELETE FROM DesignTable_${id}`,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}

/********************************************************************************/
/*										*/
/*	Action	methods 							*/
/*										*/
/********************************************************************************/

function handleUpload(req,res,lesson)
{
   console.log("FILES",req.body,req.params,req.session.user,req.files);

   let id = lesson.lesson_id;
   db.query(`DELETE FROM DesignTable_${id} WHERE bannerid = $1`,
                [req.session.user.bannerid],
	(e1,d1) => { handleUpload1(req,res,lesson,e1,d1); } );
}


function handleUpload1(req,res,lesson,err,data)
{    
    let file = null;
    if (req.files.designfile != null) file = req.files.designfile.file;
    else file = req.files[0].path;
    let bannerid = req.session.user.bannerid;
    let id = lesson.lesson_id;
    let cmd = `INSERT INTO DesignTable_${id}(bannerid,filename) VALUES($1,$2)`;
    db.query(cmd,[bannerid,file],(e1,d1) => { handleUpload2(req,res,lesson,e1,d1); });
}


function handleUpload2(req,res,lesson,err,data)
{
    let id = lesson.lesson_id;
    lesson.enterGrade(req,res,id,'designupload',handleUpload3);    
}


function handleUpload3(req,res)
{
    res.redirect('/lessons');
}


/********************************************************************************/
/*										*/
/*	Action methods to show comments on a desgin				*/
/*										*/
/********************************************************************************/

function handleShowFeedback(req,res,lesson)
{
    let data = { lesson_id : lesson.crits_id };
    lesson.showPage(req,res,'designfeedback',data);  
}




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = DesignLesson;




/* end of designlesson.js */





