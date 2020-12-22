/********************************************************************************/
/*										*/
/*		critslesson.js							*/
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
const config = require("./config");
const LessonBase = require("./lessonbase.js").LessonBase;
const fs = require("fs");


/********************************************************************************/
/*										*/
/*	Main class definition							*/
/*										*/
/********************************************************************************/

class CritsLesson extends LessonBase {

   constructor(name,id,row) {
	   super(name,id);
	   this.design_id = row.reference;
	   }

   localInitializeLesson(next) { initialize(this,next); }
   localResetLesson(next) { clearLesson(this,next); }

   doAction(req,res,act) {
      if (act == 'getdesign') {
	 handleGetDesign(req,res,this);
       }
      else if (act == 'showdesign') {
	  handleShowDesign(req,res,this);
      }
      else if (act == 'critdesign') {
	 handleCritDesign(req,res,this);
       }
      else if (act == 'getfeedback') {
	      handleCritFeedback(req,res,this);
      }
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
   db.query("DROP TABLE IF EXISTS CritsTable_" + id,(e1,d1) => { initialize1(id,next,e1,d1); } );
}


function initialize1(id,next,err,data)
{
   let cmd = "CREATE TABLE CritsTable_" + id + "( ";
   cmd += " bannerid character(16), ";
   cmd += " filename character(128), "
   cmd += " likes text,"
   cmd += " dislikes text,"
   cmd += " improve text"
   cmd += ");";
   db.query(cmd,(e1,d1) => { commandEnd(id,next,e1,d1); } );
}


function commandEnd(id,next,err,data)
{
   if (next != null) next();
}


function clearLesson(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query("DELETE FROM CritsTable_" + id,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}


/********************************************************************************/
/*										*/
/*	Action methods to get a design to evaluate				*/
/*										*/
/********************************************************************************/

function handleGetDesign(req,res,lesson)
{
   db.query("SELECT * FROM DesignTable_" + lesson.design_id +
	       " WHERE bannerid != $1 ORDER BY uses",
	[req.session.user.bannerid],
	(e1,d1) => { handleGetDesign1(req,res,lesson,e1,d1); } );
}


function handleGetDesign1(req,res,lesson,err,data)
{
   let ln = data.rows.length;
   let use = -1;
   for (let i = 0; i < ln; ++i) {
      if (use == -1) use = data.rows[i].uses;
      else if (data.rows[i].uses > use) {
	 ln = i;
	 break;
       }
    }

   let rslt = { };
   let idx = 0;
   let row = null;
   if (ln == 0) {
      rslt = { status: "NONE" };
    }
   else {
      idx = Math.floor(Math.random() * ln);
      row = data.rows[idx];
      req.session.design = row;
      req.session.save();
      rslt = { status: "OK",
		   bannerid : row.bannerid,
		   file : row.filename,
		   lessonid : lesson.lesson_id };
    }
    console.log("GETDESIGN",rslt);
   res.end(JSON.stringify(rslt));

   if (ln > 0) {
      db.query("UPDATE DesignTable_" + lesson.design_id + 
         " SET uses = $1 WHERE bannerid = $2",[use+1,row.bannerid]);
   }
}



/********************************************************************************/
/*										*/
/*	Action methods to display a design file 				*/
/*										*/
/********************************************************************************/

function handleShowDesign(req,res,lesson)
{
    let filepath =  req.session.design.filename;
    let stat = fs.statSync(filepath);
    console.log("SHOWDESIGN",stat.size,filepath);
    res.setHeader("Content-Length'",stat.size);
    if (filepath.endsWith(".pdf"))
       res.setHeader("Content-Type","application/pdf");
    let file = fs.createReadStream(filepath);
    file.pipe(res);
}



/********************************************************************************/
/*										*/
/*	Action methods to handle comments on a design				*/
/*										*/
/********************************************************************************/

function handleCritDesign(req,res,lesson)
{
   let critid = req.body.critid;
   let critfile = req.body.critfile;
   let critlikes = config.htmlSanitize(req.body.likes);
   let critdislikes = config.htmlSanitize(req.body.dislikes);
   let critimprove = config.htmlSanitize(req.body.improve);
   let cmd = "INSERT INTO CritsTable_" + lesson.lesson_id;
   cmd += " (bannerid, filename, likes, dislikes, improve)";
   cmd += " VALUES ( $1,$2,$3,$4,$5 )";
   db.query(cmd,[critid,critfile,critlikes,critdislikes,critimprove],
	       (e1,d1) => { handleCritsDesign1(req,res,lesson,e1,d1); });
}



function handleCritsDesign1(req,res,lesson,err,data)
{
   lesson.showPage(req,res,'designfeedback',{ });
}


/********************************************************************************/
/*										*/
/*	Action methods to show comments on a desgin				*/
/*										*/
/********************************************************************************/

function handleCritFeedback(req,res,lesson)
{
   db.query("SELECT * FROM DesignTable_" + lesson.design_id + " WHERE bannerid = $1",
	       [req.session.user.bannerid],
	       (e1,d1) => { handleCritFeedback1(req,res,lesson,e1,d1); } );
    }


function handleCritFeedback1(req,res,lesson,err,data)
{
   let file = data.rows[0].filename;

   let cmd = "SELECT * FROM CritsTable_" + lesson.lesson_id;
   cmd += " WHERE bannerid = $1";
   db.query(cmd,[req.session.user.bannerid],
	       (e1,d1) => { handleCritFeedback2(req,res,lesson,e1,d1); } );
}


function handleCritFeedback2(req,res,lesson,err,data)
{
   let rslt = "";
   for (let row of data.rows) {
      rslt += `<hr><h3>Likes</h3><p>${row.likes}<br>
		<h3>Dislikes</h3><p>${row.dislikes}<br>
		<h3>Improvements</h3><p>${row.improve}<br>`;
    }
    console.log("FEEDBACK RESULT",rslt);
   let ret = { html: rslt };
   res.end(JSON.stringify(ret));
}




/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = CritsLesson;




/* end of critslesson.js */
