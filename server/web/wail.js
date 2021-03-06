/****************************************************************************************/
/*											*/
/*		wail.js 								*/
/*											*/
/*	Internal JavaScript for WAIL interactive lessons				*/
/*											*/
/****************************************************************************************/



/****************************************************************************************/
/*											*/
/*	Login methods									*/
/*											*/
/****************************************************************************************/

function handleLoginEnter(evt)
{
   if (evt.keyCode == 13 || evt.keyCode == 9) {
      evt.preventDefault();
      $('#loginsubmit').click();
   }
}

function handleLoginSubmit(evt)
{
   evt.preventDefault();
   let x = $('#loginid').val();
   let p = null;
   if (x == null || x == "") return setLoginError('Must specify id');
   if (x.startsWith('admin')) {
      if (!$('#loginpwd').is(":visible")) {
	 $('#loginpwd').show();
	 return;
      }
      p = $('#loginpwd').val();
      if (p == null || p == '') return setLoginError('Must specify password for admin');
      let bits = sjcl.hash.sha256.hash(p);
      p = sjcl.codec.hex.fromBits(bits);
   }
   let data = { user : x, password: p };
   fetch('/login', {
       method: 'POST',
       headers: {
	       'Content-Type': 'application/json'
       },
       body: JSON.stringify(data)  })
   .then( (resp) => { let v = resp.json(); return v; } )
   .then( handleLoginStatus)
   .catch( (e) => { setLoginError(e) } );
}

function handleLoginStatus(sts)
{
   if (sts.status == 'OK') {
      window.location.href = '/lessons';
   }
   else if (sts.status == 'ADMIN') {
      window.location.href = '/admin/home';
   }
   else if (sts.status == 'ERROR') {
      setLoginError(sts.message);
   }
   else setLoginError("Problem logging in");
}


function setLoginError(msg)
{
	setErrorField(msg,'loginError');
}


function setErrorField(msg,fld)
{
   let fldid = "#" + fld;
   $(fldid).text(msg);
   $(fldid).show();
}


/****************************************************************************************/
/*											*/
/*	Design methods									*/
/*											*/
/****************************************************************************************/

function handleDesignSubmit(evt,filefield,errorfield)
{
   let file = $("#" + filefield).val();
   if (file == null || file == '') {
	setErrorField("Must specify file before proceeding",errorfield);
	evt.preventDefault();
   }
}



/****************************************************************************************/
/*											*/
/*	Crits methods									*/
/*											*/
/****************************************************************************************/

function handleCritsGetDesign(evt,lessonid)
{
	evt.preventDefault();
	let data = { };
	fetch('/lesson/' + lessonid + "/action/getdesign", {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)  })
	    .then( (resp) => { let v = resp.json(); return v; } )
	    .then( handleCritsGetDesign1)
	    .catch( (e) => { console.log("ERROR",e); } );
}



function handleCritsGetDesign1(resp)
{
	console.log("CRITSGET",resp);
    let sts = resp.status;
    $("#getdesignerror").hide();
    if (sts == 'NONE') {
	$("#getdesignerror").show();
	return;
    }
    let bannerid = resp.bannerid;
    let file = resp.file;
    let lessonid = resp.lessonid;
    $("#critid").val(bannerid);
    $("#critfile").val(file);
    $("#critsgetdesign").hide();
    $("#critsshowdesign").show();
    $("#critsfeedback").show();
//     let path = "/lesson/" + lessonid + "/action/showdesign";
//     console.log("LOAD ",path);
//     window.open(path);
}


function handleFeedbackRequest(lessonid,div)
{
	let data = { };
	fetch('/lesson/' + lessonid + '/action/getfeedback', {
		method: 'POST',
		headers: {
			'Content-Type' : 'application/json'
		},
		body: JSON.stringify(data) } )
	.then( (resp) => { let v = resp.json(); v.div = div; return v; } )
	.then( handleFeedbackRequest1 )
	.catch( (e) => { throw e; } );
}


function handleFeedbackRequest1(data)
{
   $("#feedbacktext").html(data.html);
}



/****************************************************************************************/
/*											*/
/*	Sql Injection methods								*/
/*											*/
/****************************************************************************************/

function handleSqlInjectionSubmit(evt,lid)
{
   evt.preventDefault();
   let u = $("#sqlinjectionuser").val();
   let p = $("#sqlinjectionpwd").val();
   let data = { user: u, password: p}
   fetch(`/lesson/${lid}/action/attempt`, {
	   method: 'POST',
	   headers: {
		   'Content-Type' : 'application/json'
	   },
	   body: JSON.stringify(data) } )
     .then( (resp) => { let v = resp.json(); console.log("RESP",v); return v; } )
     .then ( handleSqlInjectionSubmit1 )
     .catch( (e) => { throw e; } );
}



function handleSqlInjectionSubmit1(data)
{
   console.log("SQL ",data);
   $("#resultfail").hide();
   $("#resultsuccess").hide();

   if (data.login) {
	$("#loginuser").text(data.user);
	if (data.admin) $("#adminpriv").show();
	$("#resultsuccess").show();
   }
   else if (data.status == 'ERROR' || data.status == 'NONE') {
	$("#queryreason").text(data.message);
	$("#queryinput").text(data.query);
	$("#queryresult").html();
	$("#resultfail").show();
   }
   else {
	$("#queryreason").text(data.message);
	$("#queryinput").text(data.query);
	let text = "<TABLE><TR><TH>User</TH><TH>Password</TH><TH>Admin</TH></TR>";
	for (let row of data.rows) {
	   text += `<TR><TD>${row.user}</TD><TD>${row.pwd}</TD><TD>${row.admin}</TD></TR>`;
	}
	text += "</TABLE>";
	$("#queryresult").text();
	$("#queryresult").html(text);
	$("#resultfail").show();
   }
}


/****************************************************************************************/
/*											*/
/*	Admin checking methods								*/
/*											*/
/****************************************************************************************/

function checkNewLesson(evt)
{
    let err = null;
    let lbl = $("#newid").val();
    if (lbl == null || lbl == '') return newLessonError(evt,'Label must not be null');
    let name = $("#newname").val();
    if (name == null || name == '') return newLessonError(evt,"Name must not be null)");
    let desc = $("#newdesc").val();
    if (desc == null || desc.length() < 5)
	return newLessonError(evt,"Description must be present");
    let mod = $("#newmodule").val();
    if (mod == null || mod == '') return newLessonError(evt,"Module must be specified");
    let dat = $("#newdate").val();
    if (dat == null) return newLessonError(evt,"Date must be specified");
}



function newLessonError(evt,msg)
{
   setErrorField(msg,'newlessonerror');
   evt.preventDefault();
}



/* end of wail.js */
