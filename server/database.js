/********************************************************************************/
/*										*/
/*		database.js							*/
/*										*/
/*	Database query methods							*/
/*										*/
/********************************************************************************/


const config = require("./config");




/********************************************************************************/
/*										*/
/*	Imports 								*/
/*										*/
/********************************************************************************/

const adb = require('any-db');



/********************************************************************************/
/*										*/
/*	Initializations 							*/
/*										*/
/********************************************************************************/

const db_connect = config.dbConnect();
const pool = adb.createPool(db_connect,{ min : 1, max : 4 });




/********************************************************************************/
/*										*/
/*	Query promises								*/
/*										*/
/********************************************************************************/

function pquery(q,prms)
{
    return new Promise( (accept,reject) => {
            query(q,prms,(e,d) => { if (e != null) reject(e); else accept(d); } )
    });    
}



/********************************************************************************/
/*										*/
/*	Query function								*/
/*										*/
/********************************************************************************/

function query(q,prms,next)
{
   if (prms instanceof Function) {
      next = prms;
      prms = undefined;
    }

   console.log("DATABASE:",q,prms);

   q = fixQuery(q);

   return pool.query(q,prms,callback(next));
}



function callback(next)
{
   return function(err,data) {
      console.log("DATABASE RESULT",err,data);
      if (next != null) next(err,data);
    }
}




/********************************************************************************/
/*										*/
/*	Handle mysql - postgresql differences on parameters			*/
/*										*/
/********************************************************************************/

function fixQuery(q)
{
   if (db_connect.substring(0,5) == "mysql") {
      q = q.replace(/\$\d+/g,"?");
    }

   return q;
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.query = query;




/* end of database.js */
