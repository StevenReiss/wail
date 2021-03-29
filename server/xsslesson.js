/********************************************************************************/
/*										*/
/*		xsslesson.js							*/
/*										*/
/*	Implementation of XSS lessons						*/
/*										*/
/********************************************************************************/



/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const db = require("./database.js");
const config = require("./config.js");
const LessonBase = require("./lessonbase.js").LessonBase;



/********************************************************************************/
/*										*/
/*	Main class definition							*/
/*										*/
/********************************************************************************/

class XSSLesson extends LessonBase {

   constructor(name,id) {
      super(name,id);
    }

   doAction(req,res,act) {
      if (act == 'showpage') {
	 handleShowPage(req,res,this);
       }
      else if (act == 'altpage') {
	 handleAltPage(req,res,this);
       }
      else if (act == 'done') {
	 handleDone(req,res,this);
       }
    }

}	// end of class Cross Site Scriptiing Lesson




/********************************************************************************/
/*										*/
/*	Action	methods 							*/
/*										*/
/********************************************************************************/

function handleShowPage(req,res,lesson)
{
   let u = req.body.name;
   let s = req.body.secret;
   let rdata = { firstname : u, title : "XSS Test Page" };
   res.append("X-XSS-Protection","0");
   res.append("Content-Security-Policy","unsafe-inline");
   lesson.showPage(req,res,'xsslesson',rdata);
   lesson.enterGrade(req,res,lesson.lesson_id);
}


function handleAltPage(req,res,lesson)
{
   let u = req.body.name;
   let s = req.body.secret;
   u = config.htmlSanitize(u);

   let rdata = { user : u, secret: s, title: "XSS Success Page" };
   lesson.showPage(req,res,'xssresult',rdata);
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

exports.Lesson = XSSLesson;




/* end of xsslesson.js */
