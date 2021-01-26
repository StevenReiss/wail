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
const process = require('child_process');



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

    localGetLessonParameters(req,res,next) { checkStatus(req,res,this,next); }
    
}


/********************************************************************************/
/*										*/
/*	Setup methods								*/
/*										*/
/********************************************************************************/

function initialize(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query(`DROP TABLE IF EXISTS FrontEnd_${id}`,(e1,d1) => { initialize1(lesson,next,e1,d1); } );
}


function initialize1(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = `CREATE TABLE FrontEndTable_${id}( `;
   cmd += " bannerid character(16), ";
   cmd += " group character(128), ";
   cmd += " designfile character(128) DEFAULT NULL, "
   cmd += " webdirectory character(128) DEFAULT NULL, "
   cmd += " finished boolean DEFAULT false, "
   cmd += " PRIMARY KEY (bannerid) "
   cmd += ");";
   db.query(cmd,(e1,d1) => { initialize2(lesson,next,e1,d1); } );
}


function initialize2(lesson,next,err,data)
{
   let id = lesson.lesson_id;     
   let cmd = `CREATE INDEX FrontEndGroupIndex_${id} on FrontEndTable_${id}(group)`;
   db.query(cmd,(e1,d1) => { commandEnd(lesson,next,e1,d1); } );
}



function commandEnd(lesson,next,err,data)
{
   if (next != null) next();
}


function clear(lesson,next)
{
   let id = lesson.lesson_id;     
   db.query(`DELETE FROM FrontEndTable_${id}`,(e1,d1) => {  commandEnd(id,next,e1,d1); })
}



/********************************************************************************/
/*										*/
/*	Get parameters for web page						*/
/*										*/
/********************************************************************************/

function checkStatus(req,res,lesson,next) 
{
   let id = lesson.lesson_id;
   let q = `SELECT F2.designfile,F2.group FROM FrontEndTable_${id} F1, FrontEndTable_${id} F2`;
   q += " WHERE F1.bannerid = $1 AND F1.group = F2.group AND F2.designfile != NULL";
  
   db.query(q,
        [ req.session.user.bannerid],
        (e1,d1) => { checkStatus1(req,res,lesson,next,e1,d1); } );
}


function checkStatus1(req,res,lesson,next,err,data)
{
  let rslt = { designed : false };  
  if (data != null && data.rows.length > 0) {
          rslt.group = data.rows[0].group;
          rslt.designed = true;
  }
  if (next != null) next(req,res,rslt);     
}



/********************************************************************************/
/*										*/
/*	Design upload methods							*/
/*										*/
/********************************************************************************/

function handleDesignUpload(req,res,lesson)
{
    console.log("DFILES",req.body,req.params,req.session.user,req.files);

    let id = lesson.lesson_id;
    db.query(`DELETE FROM FrontEndTable_${id} WHERE bannerid = $1`,
        [req.sesson.user.bannerid],
        (e1,d1) => { handleDesignUpload1(req,res,lesson,e1,d1); } );
}


function handleDesignUpload1(req,res,lesson,err,data)
{
    let id = lesson.lesson_id;
    let file = null;
    if (req.file.htmlcssfile != null) file = req.files.htmlcssfile.file;
    else if (req.files.length > 0) file = req.files[0].path;
    let bannerid = req.session.user.bannerid;
    let group = req.params.htmlcssgroup;
    let cmd = `INSERT INTO FrontEndTable_${id} (bannerid,group,designfile) VALUES($1,$2,$3)`;
    db.query(cmd,[bannerid,group,file], 
        (e1,d1) => { handleDesignUpload2(req,res,lesson,e1,d1); } );
}



function handleDesignUpload2(req,res,lesson,err,data)
{
        lesson.enterGrade(req,res,lesson.lesson_id + "design",
        ()  => { handleDesignUpload3(req,res,lesson); });
}


function handleDesignUpload3(req,res,lesson) 
{
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
   
    let id = lesson.lesson_id;
    if (req.files == null || req.files.length == 0) throw "No file given";
    if (req.files[0].fieldname == 'webfile1') {
            uploadCompressed(req.files[0].path,req.params.htmlcssgroup,req,res,lesson);
    }
    else {
            uploadDirectory(req.files,req,res,lesson);
    }
}


function uploadCompressed(file,group,req,res,lesson)
{
        args = [ group, lesson.lesson_name, "-x", file ];

        handleUpload(args,req,res,lesson);
       
}
  

function uploadDirectory(files,req,res,lesson)
{
   let group = req.params.htmlcssgroup;
   let paths = req.params.webfile2paths.split("###");
   let args = [];

   args.push(group);
   args.push(lesson.lesson_name);
   for (let i = 0; i < files.length; ++i) {
           args.push(files[i].path);
           args.push(paths[i]);
   }

   // run uploader with args
   handleUpload(args,req,res,lesson);
}



function handleUpload(args,req,res,lesson)
{
   process.execFile("uploadwebfiles.csh",args,{ windowHide: true},
        (err,stdout,stderr) => { handleDesignUpload1(err,stdout,stderr,req,res,lesson); });
}



function handleUpload1(err,stdout,stderr,req,res,lesson)
{
        console.log("UPLOAD",err,stdout,stderr);
        res.redirect('/lessons');
}

/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.Lesson = FrontEndLesson;




/* end of frontendlesson.js */