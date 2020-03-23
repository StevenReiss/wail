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
   lessonbase.handleAdminAction(req,res);
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
