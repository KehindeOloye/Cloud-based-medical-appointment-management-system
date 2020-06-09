
try	{
	$(function()
		{
		init();
		}
	);
	} catch (e)
		{
		alert("*** jQuery not loaded. ***");//alert("*** jQuery not loaded. ***");
		}


function init()
{
	
	$( "#datepicker" ).datepicker({
		dateFormat:"yy-mm-dd"
	}).datepicker("setDate",'1');
	
	populateGPNames();	//used to populate our GP select box from our web service(url:/cmm529_cw) using the Ugr class
	
	// Below consists of the initialization of our select box values;
	
	$("#hour_selector").val("00");
	$("#minute_selector").val("00");
	$("#appointmentYear").val("2016");
	$("#appointmentMonth").val("May");
	
	
	// We populate our select options for our hour, minute, and appointment year selectors below;
	var select1 = "";
		for (i=0;i<=9;i++){
	    	select1 += "<option val=0" + i + ">" +"0"+ i + "</option>";
		}
		for (i=10;i<=23;i++){
		    select1 += "<option val=" + i + ">" + i + "</option>";
		}
	$("#hour_selector").html(select1);

	var select2 = "";
		for (i=0;i<=9;i++){
		    select2 += "<option val=0" + i + ">" +"0"+ i + "</option>";
		}
		for (i=10;i<=59;i++){
			 select2 += "<option val=" + i + ">" + i + "</option>";
		}
	$("#minute_selector").html(select2);

	var select3 = "";
		for (i=2016;i<=2040;i++){
			select3 += "<option val=" + i + ">" + i + "</option>";
		}
	$("#appointmentYear").html(select3);
	
	// The AddappointmentDetails dialog is created below;
	$("#AddappointmentDetails").dialog(//options to dialog box as a map
		{
			title: "Add an Appointment",
			autoOpen: false,	//is hidden by default
			modal: true,		//disables parent when it is opened
			minWidth: 300,		//min 500px wide
			minHeight: 200		//min 400px tall
		}); //end call to dialog
	
	$("#makeAppointment").click(function(){
		// Client-side validation to ensure that the patientname text box is not empty
		if($("#patientname").val() == ''){
				 alert("Patient name cannot be empty");
	               return;
		 }
		  $("#deleteAppointment").hide();				// The deleteAppointment button is not required here, so it is hidden
		  $("#AddappointmentDetails").dialog("open",true);// opens AddappointmentDetails dialog
		});
	
		$("#showAppointment").click(function()
			{
			populateAppointment();		// populate appointment using web service (url:/editappointment )
				});

		$("#cancelAppointment").click(function(){
				$("#AddappointmentDetails ").dialog("close"); // close AddappointmentDetails dialog box
		});
		
		
		$("#saveAppointment").click(function()
		{
			var a =  $("#myid").val();
			if (a == ''){
				saveAppointment();	//save appointment to web service using do post method
				}
			else{
				updateAppointment(); // this will call do put method, to update appointment
				}
			$("#AddappointmentDetails ").dialog("close");	// close AddappointmentDetails dialog box
		});
		
		$("#deleteAppointment").click(function(){
			$("#myappointments .selected").each(function(){
				deleteAppointment($(this).attr("id")); // delete an appointment based on its id
				$(this).remove();					// remove it from the list 
				});
				$("#AddappointmentDetails ").dialog("close");	// close AddappointmentDetails dialog box
			});
		
		$("#showCalendar").click(function(){
			$("#table").empty();
			getGpAppointmentdayTable(); // the function that gets GP's appointment
			setCalendar();	// calls the function that creates the GP appointment table
				});
} // end of init() function

	
		
	function myleapYear(year) {
	if (year % 4 == 0) // rule for finding leap year
	return true; // is leap year
	/* else */ // else not needed when statement is "return"
	return false; // is not leap year
	}
	function mygetDays(monthName, year) {
		// create array to hold number of days in each month
		var array = new Array(12);
		array["January"] = 31; // January
		array["February"] = (myleapYear(year)) ? 29 : 28; // February
		array["March"] = 31; // March
		array["April"] = 30; // April
		array["May"] = 31; // May
		array["June"] = 30; // June
		array["July"] = 31; // July
		array["August"] = 31; // August
		array["September"] = 30; // September
		array["October"] = 31; // October
		array["November"] = 30; // November
		array["December"] = 31; // December
		// return number of days in the specified month (parameter)
		return array[monthName];
		}
	
	function setCalendar() {
		var now = new Date();
		var date = now.getDate();
		now = null;
		var year = $("#appointmentYear option:selected").text();
		var monthName = $("#appointmentMonth option:selected").text();
		var month = 0;
		if(monthName == "January") {
		    month = 0;
		} else if (monthName == "February"){
			month = 1;
		}
		else if (monthName == "March"){
			month = 2;
		}
		else if (monthName == "April"){
			month = 3;
		}
		else if (monthName == "May"){
			month = 4;
		}
		else if (monthName == "June"){
			month = 5;
		}
		else if (monthName == "July"){
			month = 6;
		}
		else if (monthName == "August"){
			month = 7;
		}
		else if (monthName == "September"){
			month = 8;
		}
		else if (monthName == "October"){
			month = 9;
		}
		else if (monthName == "November"){
			month = 10;
		}
		else if (monthName == "December"){
			month = 11;
		}
		// creates the instance of the first day of month, and gets the day on which it occurs
		var firstDayInstance = new Date(year, month, 1);
		var firstDay = firstDayInstance.getDay();
		firstDayInstance = null;

		// number of days in current month is given as;
		var days = mygetDays(monthName, year);
		
		// this function is called to draw calendar
		drawCalendar(firstDay + 1, days, date, monthName, year);
		}

	function drawCalendar(firstDay, lastDate, date, monthName, year) {
		
		// the fixed table settings sre given below;
		var myheaderHeight = 5; // this represents the height of the table's header cell
		var border = 1; // this is the 3D height of table's border

		var myheaderCol = "midnightblue";// this is the color of table's header
		var myheaderSize = "+1"; // size of the font of the table's header
		var mycolWidth = 5; // table's column width
		var mydayCellHeight = 2; // height of cells containing days of the week
		var ourColor = "darkblue"; // color of font representing week days
		var mycellHeight = 5; // height of cells representing dates in the calendar
		
		// create basic table structure
		var mytable = "";// initialize accumulative variable to empty string
		mytable += '<CENTER>';
		mytable += '<TABLE id = "mytable">'; // table settings
		mytable += '<TH COLSPAN=7 HEIGHT=' + myheaderHeight + '>'; // create table header cell
		mytable += '<FONT COLOR="' + myheaderCol + '" SIZE=' + myheaderSize + '>'; // set font for table header
		mytable += monthName + ' ' + year ;
		mytable += '</FONT>' ;// close table header's font settings
		mytable += '</TH>'; // close header cell

		// variables to hold constant settings
		var openColumn = '<TD WIDTH=' + mycolWidth + ' HEIGHT=' + mydayCellHeight + '>';
		openColumn += '<FONT COLOR="' + ourColor + '">';
		var closeColumn = '</FONT></TD>';

		// create array of abbreviated day names
		var weekDay = new Array(7);
		weekDay[0] = "Sun";
		weekDay[1] = "Mon";
		weekDay[2] = "Tues";
		weekDay[3] = "Wed";
		weekDay[4] = "Thu";
		weekDay[5] = "Fri";
		weekDay[6] = "Sat";

		// create first row of table to set column width and specify week day
		mytable += '<TR ALIGN="center" VALIGN="center">';
		for (var mydayNum = 0; mydayNum < 7; ++mydayNum) {
			mytable += openColumn + weekDay[mydayNum] + closeColumn;
		}
		mytable += '</TR>';

		// declaration and initialization of two variables to help with tables
		var dayNum = 1;
		var thepresentCell = 1;

		for (var row = 1; row <= Math.ceil((lastDate + firstDay - 1) / 7); ++row) {
		mytable += '<TR ALIGN="right" VALIGN="top">';
		for (var column = 1; column <= 7; ++column) {
		if (dayNum > lastDate)
		break;
		if (thepresentCell < firstDay) {
		mytable += '<TD></TD>';
		thepresentCell++;
		} 
		else {
		if (dayNum == date) { // if the current cell represent today's date, show date, but we decided not to implement this again in order not to confuse it with dates that have appointments
		mytable += '<TD class="day" HEIGHT="' + mycellHeight + '" id = ' + dayNum + '>';
		mytable += dayNum;
		mytable += '</TD>';
		} 
		
		else 
		mytable += '<TD class="day" HEIGHT=' + mycellHeight + ' id = ' + dayNum + '>' + dayNum + '</TD>';
		dayNum++;
		}
		}
		
		mytable += '</TR>'; 
		}
		mytable += '</TABLE>';
		mytable += '</CENTER>'
		$("#table").append(mytable);
		
		$("#table .day").click(function() // attach a click handler to every table td of class named day which represents td of days in which an appointment can occur
			{
			//The code below uses a web service to get the duration of time from the start to the end of each selected day in which there is an appointment and gets the appointment details and patient's name and attaches it to a html list
			var day=$(this).attr("id");
			var gpname = $("#nameOfGP option:selected").text();
			var theyear = $("#appointmentYear option:selected").text();
			var themonthName = $("#appointmentMonth option:selected").text();
			var themonth = 0;
			if(themonthName == "January") {
				themonth = 0;
				
			} else if (themonthName == "February"){
				themonth = 1;
				
			}
			else if (themonthName == "March"){
				themonth = 2;
			}
			else if (themonthName == "April"){
				themonth = 3;
			}
			else if (themonthName == "May"){
				themonth = 4;
			}
			else if (themonthName == "June"){
				themonth = 5;
			}
			else if (themonthName == "July"){
				themonth = 6;
			}
			else if (themonthName == "August"){
				themonth = 7;
			}
			else if (themonthName == "September"){
				themonth = 8;
			}
			else if (themonthName == "October"){
				themonth = 9;
			}
			else if (themonthName == "November"){
				themonth = 10;
			}
			else if (themonthName == "December"){
				themonth = 11;
			}
			
			
			var from  = new Date();
			from.setYear(theyear);
			from.setMonth(themonth);
			from.setDate(day);
			from.setHours(00);
			from.setMinutes(00);
			from.setSeconds(00);
			var longfrom = from.getTime();
			
			var to = new Date();
			to.setFullYear(theyear);
			to.setMonth(themonth);
			to.setDate(day);
			to.setHours(23);
			to.setMinutes(59);
			to.setSeconds(59);
			var longto = to.getTime();
			
			var url = "/editgpappointment";
			var data = {
				"gpname":gpname,
				"from":longfrom,
				"to":longto
					};
				$.getJSON(url, data,
					function(theappointmentsTime){
						$("#gpappointmentslist").empty();
							//return JSON data is a list of appointment info.
							for (var i in theappointmentsTime){
								var appointment = theappointmentsTime[i];
								var id=appointment["id"];
								var gpname = appointment["gpName"] ;
								var patientName = appointment["patientName"];
								var longDateTime = appointment["dateTime"];
								var d = new Date(longDateTime);
								alert(d);
								var datestring = d.getFullYear()  + "-" +("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " +
								("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
								var htmlCode="<li  id='"+id+"'>"+ datestring + ' ' + patientName +"</li>";
								$("#gpappointmentslist").append(htmlCode);	
												}
											});	
										});
	}

	function getGpAppointmentdayTable(){
		// The code below gets the duration of time within a month for which an appointment is booked with a particular GP, gets the day the appointments occur and colors the background of such td of the gpappointment table
		// It uses the webe= service, (url:/editgpappointment)
		var gpname = $("#nameOfGP option:selected").text();
		var theyear = $("#appointmentYear option:selected").text();
		var themonthName = $("#appointmentMonth option:selected").text();
		var themonth = 0;
		var theMaximumDay = 0;
		if(themonthName == "January") {
			themonth = 0;
			theMaximumDay = 31;
		} else if (themonthName == "February"){
			themonth = 1;
			if (theyear % 4 == 0){
			theMaximumDay = 29
			} else{
			theMaximumDay = 28;
			}
		}
		else if (themonthName == "March"){
			themonth = 2;
			theMaximumDay = 31;
		}
		else if (themonthName == "April"){
			themonth = 3;
			theMaximumDay = 30;
		}
		else if (themonthName == "May"){
			themonth = 4;
			theMaximumDay = 31;
		}
		else if (themonthName == "June"){
			themonth = 5;
			theMaximumDay = 30;
		}
		else if (themonthName == "July"){
			themonth = 6;
			theMaximumDay = 31;
		}
		else if (themonthName == "August"){
			themonth = 7;
			theMaximumDay = 31;
		}
		else if (themonthName == "September"){
			themonth = 8;
			theMaximumDay = 30;
		}
		else if (themonthName == "October"){
			themonth = 9;
			theMaximumDay = 31;
		}
		else if (themonthName == "November"){
			themonth = 10;
			theMaximumDay = 30;
		}
		else if (themonthName == "December"){
			themonth = 11;
			theMaximumDay = 31;
		}
	
		var myFromDateValueFirst  = new Date();
		myFromDateValueFirst.setYear(theyear);
		myFromDateValueFirst.setMonth(themonth);
		myFromDateValueFirst.setDate(1);
		myFromDateValueFirst.setHours(00);
		myFromDateValueFirst.setMinutes(00);
		myFromDateValueFirst.setSeconds(00);
		var longmyFromDateValueFirst = myFromDateValueFirst.getTime();
		var myToDateValueLast = new Date();
		myToDateValueLast.setFullYear(theyear);
		myToDateValueLast.setMonth(themonth);
		myToDateValueLast.setDate(theMaximumDay);
		myToDateValueLast.setHours(23);
		myToDateValueLast.setMinutes(59);
		myToDateValueLast.setSeconds(59);
		var longmyToDateValueLast = myToDateValueLast.getTime();
		var url = "/editgpappointment";
		var data = {
			"gpname":gpname,
			"from":longmyFromDateValueFirst,
			"to":longmyToDateValueLast
		};
		$.getJSON(url, data,
			function(appointmentsTime){
				for (var i in appointmentsTime)
					{
					var appointment = appointmentsTime[i];
					var id=appointment["id"];
					var gpname = appointment["gpName"] ;
					var patientName = appointment["patientName"];
					var longDateTime = appointment["dateTime"];
					var d = new Date(longDateTime);
					var dayofAppointment = d.getDate();
					$("#"+dayofAppointment).css("background", "#fff");
					}
				});	
	}

		function populateAppointment() // used to populate appointment list using the web service (url:/editappointment)
		{
			var thepatientname = $("#patientname").val();
			var url = "/editappointment";
			var data = {"patientname":thepatientname};
			$.getJSON( url, data, function( jsonData ) {
				$("#myappointments").empty();
				for (var i in jsonData)
					{
						var appointment = jsonData[i];
						var id = appointment["id"]; 
						var gpname = appointment["gpName"] ;
						var longDateTime = appointment["dateTime"];
						var d = new Date(longDateTime);
						var datestring = d.getFullYear()  + "-" +("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " +
						("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
						var htmlCode="<li  id='"+id+"' name='"+d.getFullYear()  + "-" +("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + "-" + ("0" + d.getHours()).slice(-2) + "-" + ("0" + d.getMinutes()).slice(-2)+"' class='"+gpname+"'>"+ gpname + ' ' + datestring +"</li>";
						$("#myappointments").append(htmlCode);	
						
					}
						$("#myappointments li").click(function(){
						$("#gp").val($(this).attr("class"));
						var divide = $(this).attr("name");
						var hour = divide.substring(11,13);
						var minute = divide.substring(14,16);
						var dateNew = divide.substring(0,10);
						var id = $(this).attr("id");
						$("#datepicker").val(dateNew);
						$("#hour_selector").val(hour);
						$("#minute_selector").val(minute);
						$("#myid").val(id);
						appointmentClicked($(this).attr("id"));
						$("#AddappointmentDetails").dialog("open",true);	//show dialog
						$("#AddappointmentDetails" ).dialog({ title: "Edit an Appointment" });
						}); //end click call
				});

	}//end function
		
	function appointmentClicked(id){
		$("#myappointments li").removeClass("selected"); //remove all list items from the class "selected, thus clearing previous selection
		$("#"+id).addClass("selected");// Find the selected appointment (i.e. list item) and add the class "selected" to it.
			// This will highlight it according to the "selected" class.
	}
	
	
	function deleteAppointment(id){ // used to delete appointment with an id
		var url="/editappointment/"+id;				//URL pattern of delete service
		var settings={type:"DELETE"};	//options to the $.ajax(...) function call
		$.ajax(url,settings);
	} //end function
	
	function updateAppointment(id){ // used to update appointment with an id. It uses the webservice (url:/editappointment) do Put method.
		var gp= $("#gp option:selected").text();
		var currentDate = $("#datepicker" ).datepicker("getDate");
		var hour = $("#hour_selector option:selected").text();
		var minutes =$("#minute_selector option:selected").text();
		var id = $("#myid").val();
		currentDate.setHours(hour);
		currentDate.setMinutes(minutes);
		var longDateTime =  currentDate.getTime();
		var mydayOfWeek = currentDate.getUTCDay();
		var myhour = currentDate.getHours();
		var myminute = currentDate.getMinutes();
		// The code below checks to make sure that appointments are made on weekdays (Mon-Fri), within working hours (08:30-17:00) and not  
		if (!(mydayOfWeek > 0 && mydayOfWeek < 6)){ 
			if (!((myhour >= 8 && myminute > 30) && myhour < 17)) {
			  if((myhour > 12 && myhour < 13)){
				  alert("Error: The clinic is not open on this date");
				  return;
			  	}
			  }
			}
	$.ajax({
		  method: "PUT",
		  url: "/editappointment",
		  data: { gp:gp, longDateTime:longDateTime, id:id}
		}).done(function( msg ) {
		    alert( "Data Updated: " + msg );
		  });

}
	/**function checkTime() {
	    
			var currentDate = $("#datepicker" ).datepicker("getDate");
			var hour = $("#hour_selector option:selected").text();
			var minutes =$("#minute_selector option:selected").text();
		    currentDate.setHours(hour);
			currentDate.setMinutes(minutes);
			var longDateTime =  currentDate.getTime();
			var mydayOfWeek = currentDate.getUTCDay();
			var myhour = currentDate.getHours();
			var myminute = currentDate.getMinutes();

	    return mydayOfWeek >= 1
	        && mydayOfWeek <= 5
	        && myhour >= 12
	        && myhour <= 13
	        && myhour >= 9 
	        && (myhour < 17 || myhour === 17 && mins <= 30);
	}**/
	function saveAppointment(){ // used to save an appointment. It uses the webservice (url:/cmm529_cw) do Post method.
			var patientname= $("#patientname").val();
			var gp= $("#gp option:selected").text();
			var currentDate = $("#datepicker" ).datepicker("getDate");
			var hour = $("#hour_selector option:selected").text();
			var minutes =$("#minute_selector option:selected").text();
		    currentDate.setHours(hour);
			currentDate.setMinutes(minutes);
			var longDateTime =  currentDate.getTime();
			var mydayOfWeek = currentDate.getUTCDay();
			var myhour = currentDate.getHours();
			var myminute = currentDate.getMinutes();
			
			 // The code below checks to make sure that appointments are made on weekdays (Mon-Fri), within working hours (09:00-17:30) and not break time (12:00-13:00) 
				 /**if(0 < mydayOfWeek < 6) {
					return true;
				 	}
				  //check between 9am and 5pm
				  else if(9 <= myhour <= 17) {
				  	return true;
				  	}
				   else if( myhour !== 17 ||myminute <= 30) {
				     return true;
				     }
				   else if (12 < myhour < 13){
				     return  true;
					   }
				   else{
					   alert("Error: The clinic is not open on this date");
					   return false;
				   }**/
			/**
			 * if (!checkTime()){
			 * alert("Error: The clinic is not open on this date");
					  return;
			 * } **/
			if (!(mydayOfWeek > 0 && mydayOfWeek < 6)){ 
				if (!((myhour >= 8 && myminute > 30) && myhour < 17)) {
				  if((myhour>12 && myhour < 13)){
					  alert("Error: The clinic is not open on this date");
					  return;
				  	}
				  }
				}
			var url="/cmm529_cw";					//URL of web service
			var data={ //request parameters as a map
				"patientname": patientname,
				"gp": gp,				
				"longDateTime": longDateTime,
						};
			//use jQuery shorthand Ajax POST function
			$.post(	url,				//URL of service
					data,			//parameters of request
					function()		//successful callback function
					{
					alert("Appointment saved: "+gp+" ("+longDateTime+")");
					} //end callback function
				); //end post call
			} //end function
	
	function populateGPNames(){
		// This function is used to populate our GP select box from our web service(url:/cmm529_cw) using the Ugr class 
		var url = "/cmm529_cw";
		$.getJSON(url, 
			function(getJSONGPNAMES)
				{
			  		var selectGpNames = "";
					//return JSON data is a list of appointment info.
					for (var i in getJSONGPNAMES)
						{
						var gpNames = getJSONGPNAMES[i];
						selectGpNames += "<option val=" + gpNames + ">" + gpNames + "</option>";
						
						}
					$("#gp").html(selectGpNames);	
					$("#nameOfGP").html(selectGpNames);	
						
				});
			}//end function



	
