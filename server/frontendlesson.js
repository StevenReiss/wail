/********************************************************************************/
/*										*/
/*		frontendlesson.js 						*/
/*										*/
/*	Implementation of html/css lessons for labs				*/
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

class FrontEndLesson extends LessonBase {

    constructor(name,id,row) {
        super(name,id);
    }

   localInitializeLesson(next) { initialize(this,next); } 
   
   localResetLesson(next) { clear(this,next); }

   doAction(req,res,act) {
	   if (act == 'uploaddesign') {
	     handleDesignUpload(req,res,this);
           }
           else if (act == 'uploadwebpage') {
             handleWebUpload(req,res,this);      
           }
    }
    
}


/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query("DROP TABLE IF EXISTS FrontEnd_" + id,(e1,d1) => { initialize1(lesson,next,e1,d1); } );
}


function initialize1(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = "CREATE TABLE FrontEnd_" + id + "( ";
   cmd += " bannerid character(16), ";
   cmd += " group character(128), ";
   cmd += " designed boolean DEFAULT false, "
   cmd += " finished boolean DEFAULT false  "
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
   db.query("DELETE FROM DesignTable_" + id,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}



/********************************************************************************/
/*										*/
/*	Design upload methods							*/
/*										*/
/********************************************************************************/

function handleDesignUpload(req,res,lesson)
{
   console.log("DFILES",req.body,req.params,req.session.user,req.files);
    
    res.redirect('/lessons');
}


/********************************************************************************/
/*										*/
/*	Web site upload methods							*/
/*										*/
/********************************************************************************/

function handleWebUpload(req,res,lesson)
{
   console.log("WFILES",req.body.webfile2paths,req.parms,req.session.user,req.files);
   
   res.redirect('/lessons');
}


/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = FrontEndLesson;




/* end of frontendlesson.js */