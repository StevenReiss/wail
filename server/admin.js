/********************************************************************************/
/*										*/
/*		admin.js							*/
/*										*/
/*	Administrative functions						*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const db = require("./database.js");
const config = require("./config.js");
const lessonbase = require("./lessonbase.js");



/********************************************************************************/
/*										*/
/*	Display Admin page							*/
/*										*/
/********************************************************************************/

function displayAdminPage(req,res)
{
   checkAdmin(req);

   db.pquery("SELECT * FROM lessons ORDER BY number")
   .then((d1) => { displayAdminPage1(req,res,d1) } );
}



function displayAdminPage1(req,res,data)
{
   let rdata = { title: "WAIL Administration Page"};
   rdata.lessons = data.rows;
   rdata.user = req.session.user;

   for (lesson of rdata.lessons) {
	   if (lesson.enabled) lesson.enabled = true;
           else lesson.enabled = false;
           if (lesson.inited) lesson.inited = true;
           else lesson.inited = false;
           let sqldate = lesson.active + "";
           console.log("DATE",lesson.active,typeof(lesson.active));
           lesson.activedate = config.formatDate(lesson.active);
           console.log("DATER",lesson.activedate);
	   lesson.url = '/lesson/' + lesson.id + "/page";
     }
   console.log("ADMIN DATA",rdata);
   res.render('admin',rdata);
}




/********************************************************************************/
/*										*/
/*	Handle administrator requests						*/
/*										*/
/********************************************************************************/

function handleAdminAction(req,res)
{
   checkAdmin(req);
   if (req.params.action == 'new') {
      createNewLesson(req,res);
   }
   else {
      lessonbase.handleAdminAction(req,res);
   }
}


/********************************************************************************/
/*										*/
/*	Create a new lesson							*/
/*										*/
/********************************************************************************/

function createNewLesson(req,res)
{
   console.log("CREATE LESSON",req.params,req.body);
   
   let id = req.params.newid;

   db.query("DELETE FROM lessons WHERE id = $1",[id],
        (e1,d1) => { createNewLesson1(req,res,e1,d1); });
}


function createNewLesson1(req,res,err,data)
{
   let id = req.params.newid;
   let name = req.params.newname;
   let desc = req.params.newdesc;
   let mod = req.params.newmodule;
   let ref = req.params.newref;
   let date = req.params.newdate;
     
   if (ref == '') ref = null;

   db.query("INSERT INTO lessons(name,id,module,description,reference) " +
        "VALUES($1,$2,$3,$4,$5)",
        [name,id,mod,desc,ref],
        (e1,d1) => { createNewLesson2(req,res,err,data); } );
}



function createNewLesson2(req,res,err,data)
{
   res.redirect('/admin/home');
}


/********************************************************************************/
/*										*/
/*	Utility functions							*/
/*										*/
/********************************************************************************/

function checkAdmin(req)
{
   if (req.session.admin) return;
   throw "Not administrator";
}


/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.displayAdminPage = displayAdminPage;
exports.handleAdminAction = handleAdminAction;





/* end of admin.js */
