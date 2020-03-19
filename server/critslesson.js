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

   initializeLesson(next) {
      initialize(this.lesson_id,() => { return super.initializeLesson(next); });
   }

   enableLesson(next) {
      enabler(this.lesson_id,() => { return super.enableLesson(next); });
   }

   disableLesson(next) {
	   super.disableLesson(next);
   }

   showLesson(req,res,data) {
      if (data == null) data = { };     
      this.showPage(req,res,this.lesson_id + "lesson",data);
   }

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

function initialize(id,next)
{
   db.query("DROP TABLE IF EXISTS CritsTable_" + id,(e1,d1) => { initialize1(id,next,e1,d1); } );
}


function initialize1(id,next,err,data)
{
   let cmd = "CREATE TABLE CritsTable_" + id + "( ";
   cmd += " bannerid character(16), ";
   cmd += " filename character(128), "
   cmd += " likes text,"
   cmd += " disikes text,"
   cmd += " improve text"
   cmd += ");";
   db.query(cmd,(e1,d1) => { commandEnd(id,next,e1,d1); } );
}


function commandEnd(id,next,err,data)
{
   if (next != null) next();
}


function enabler(id,next)
{
   db.query("DELETE FROM CritsTable_" + id,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}


/********************************************************************************/
/*										*/
/*	Action	methods 							*/
/*										*/
/********************************************************************************/

function handleGetDesign(req,res,lesson)
{
   db.query("SELECT * FROM DesignTable_" + lesson.design_id + "WHERE bannerid != $1",
        [req.session.user.bannerid],
        (e1,d1) => { handleGetDesign1(req,res,id,did,e1,d1); } );
}

 
function handleGetDesign1(req,res,lesson,err,data)
{
   let ln = data.rows.length;
   let idx = Math.floor(Math.random() * ln);
   req.session.design = row[idx];
   req.session.save();
   let rslt = { bannerid : row[idx].bannerid, 
        file : row[idx].filename,
        lessonid : lesson.lesson_id };
   res.end(JSON.stringify(rslt));
}



function handleShowDesign(req,res,lesson)
{
    let filepath =  req.session.design.filename;
    let stat = fs.startSync(filepath);
    res.setHeader("Content-Length'",stat.size);
    res.setHeader("Content-Type","application/pdf");
    file.pipe(res);
//     res.download(filepath,(err) => { if (err) {
//             console.log("DOWNLOAD ERROR",err);
//     }
//     else { 
//             console.log("DOWNLOAD OK ",filepath);
//     } } );
}


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
/*	Feedback request							*/
/*										*/
/********************************************************************************/

function handleCritFeedback(req,res,lesson)
{
        db.query("SELECT * FROM DesignTable_" + lesson.design_id + "WHERE bannerid = $1",
        [req.session.user.bannerid],
        (e1,d1) => { handleCritFeedbaack1(req,res,lesson,e1,d1); } );
}


function handleCritFeedback1(req,res,lesson,err,data)
{
        let file = data.rows[0].filename;

        let cmd = "SELECT * FROM CritsTable_" + lesson.lesson_id;
        cmd += " WHERE bannerid = $1"
        db.query(cmd,[req.session.user.bannderid],
                (e1,d1) => { handleCritFeedback2(req,res,lesson,e1,d1); } );
}


function handleCritFeedback2(req,res,lesson,err,data)
{
    let rslt = "";    
    for (let row of data[rows]) {
        rslt += `<hl><h3>Likes</h3><p>${row.likes}<br>
                <h3>Dislikes</h3><p>${row.dislikes}<br>
                <h3>Improvements</h3><p>${row.improve}<br>`;
    }
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
