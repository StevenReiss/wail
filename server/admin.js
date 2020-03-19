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

   db.query("SELECT * FROM lessons ORDER BY number",(e1,d1) => { displayAdminPage1(req,res,e1,d1) } );
}



function displayAdminPage1(req,res,err,data)
{
   let rdata = { title: "WAIL Administration Page"};
   rdata.lessons = data.rows;
   rdata.user = req.session.user;

   for (lesson of rdata.lessons) {
	   if (lesson.enabled) lesson.enabled = true;
	   else lesson.enabled = false;
	   lesson.url = '/lesson/' + lesson.id + "/page";
   }

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
