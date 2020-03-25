let db = require("./database.js");


function dumpData(d)
{
   console.log("RETURNED " + d.rows.length + " ROWS");
   for (let r of d.rows) {
      console.log("ROW: ");
      for (let f in r) {
	 console.log("\t" + f + " : " + r[f]);
       }
    }
}



function showError(e)
{
   console.log("ERROR " + e);
   process.exit(0);
}


db.pquery("select * from admin")
   .then((d) => dumpData(d))
   .then(() => process.exit(0))
   .catch((e) => showError(e))

