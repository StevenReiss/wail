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
/*	Global variables 							*/
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
           db.query("UPDATE lessons SET inited = true WHERE name = $1",[this.lesson_name],
                (e1,d1) => { doNext(next) } );
        }

	enableLesson(next) {
            db.query("UPDATE lessons SET enabled = true WHERE name = $1",[this.lesson_name],
            (e1,d1) => { doNext(next) } );
	}

	disableLesson(next) {
            db.query("UPDATE lessons SET enabled = false WHERE name = $1",[this,lesson_name], 
            (e1,d1) => { doNext(next); } );
	}

        showLesson(req,res) { }
        
        doAction(res,req,act) { }

        // HELPER METHODS

        showPage(req,res,id,rdata) { 
           if (rdata == null) rdata = { };
           rdata.lesson_id = this.lesson_id;
           rdata.lesson_name = this.lesson_name;
           rdata.user = req.session.user;
           console.log("USE",rdata);
           res.render(id,rdata);
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
    console.log(id,lesson,lessons);
    lesson.showLesson(req,res);
}


function handleAction(req,res)
{
   let id = req.params.lessonid;
   let lesson = lessons[id];
   let act = req.params.action;
   lesson.doAction(req,res,act);
}


function handleAdminAction(req,res)
{
   let id = req.body.lesson;
   let act = req.body.action;
   let lesson = lessons[id];
   console.log("ADMINACTION",lesson.lesson_id,lesson.lesson_name,act);
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
           default :
              res.redirect("/admin/home");
              break;
   }
}


function handleAdminAction1(req,res)
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
   db.query("SELECT * from lessons order by number",(e1,d1) => { setupLessons1(e1,d1,next); });
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
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.LessonBase = LessonBase;
exports.handlePage = handlePage;
exports.handleAction = handleAction;
exports.handleAdminAction = handleAdminAction;
exports.setupLessons = setupLessons;



/* end of lessonbase.js */
