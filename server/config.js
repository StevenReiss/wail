/********************************************************************************/
/*										*/
/*		config.js							*/
/*										*/
/*	Configuration constants 						*/
/*										*/
/********************************************************************************/


/********************************************************************************/
/*										*/
/*	Includes								*/
/*										*/
/********************************************************************************/

const sanitizeHtml = require('sanitize-html');
const fs = require('fs');



/********************************************************************************/
/*										*/
/*	Global definitions							*/
/*										*/
/********************************************************************************/

const STATIC = '/web/';

const SESSION_KEY = 'WebApp-InterLessons-853';

const DEFAULT_PAGE = '/home';
const HOME_PAGE = '/home';


const PORT = 5002;
var   DB_CONNECT = 'mysql://wail:XXXXXX@bdognom-v2.cs.brown.edu/wail';
const PWD_FILE = '/.wailpass';

function dbConnect()
{
   let pwd = fs.readFileSync(__dirname + PWD_FILE);
   pwd = pwd.toString().trim();
   let conn = DB_CONNECT.replace("XXXXXX",pwd);
   
   return conn;
}


var ALLOWED_TAGS = [ 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a',
   'ul', 'ol', 'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code',
   'hr', 'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th',
   'td', 'pre', 'span', 'img' ];
   

var ALLOWED_ATTRS = {
      a: [ 'href', 'name', 'target' ],
	    img: [ 'src' ],
	    span: [ 'style' ]
	 }






/********************************************************************************/
/*										*/
/*	Utility functions							*/
/*										*/
/********************************************************************************/


function htmlSanitize(text)
{
        if (text == null) return "";
   return sanitizeHtml(text, {
			  allowedTags: ALLOWED_TAGS,
			  allowedAttributes : ALLOWED_ATTRS } );
}


function formatDate(date) 
{
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}



/********************************************************************************/
/*										*/
/*	Exports 								*/
/*										*/
/********************************************************************************/

exports.PORT = PORT;
exports.STATIC = STATIC;
exports.SESSION_KEY = SESSION_KEY;
exports.DEFAULT_PAGE = DEFAULT_PAGE;
exports.HOME_PAGE = HOME_PAGE;
exports.dbConnect = dbConnect;
exports.formatDate = formatDate;

exports.htmlSanitize = htmlSanitize;





/* end of config.js */


