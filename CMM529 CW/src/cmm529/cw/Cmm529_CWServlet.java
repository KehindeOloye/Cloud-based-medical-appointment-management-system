package cmm529.cw;
import java.io.IOException;			//for exception handling
import java.util.Calendar;
import java.util.List;

import javax.servlet.http.*;		//to use HTTP servlet
import javax.swing.JOptionPane;

import cmm529.clinic.Appointment;	//to use the Appointment class
import cmm529.clinic.Ugr;			//to use the Ugr class

import com.google.gson.*;			//to use the Gson class to generate JSON data

import javax.persistence.*;			//to use JPA

@SuppressWarnings("serial")
public class Cmm529_CWServlet extends HttpServlet {
	
	private  EntityManager manager=null;	//the reusable EntityManager stored in the servlet
	// The method getManager() below, is used to get an EntityManager
	// It creates if there is none, or reuse if there is already one.
	public EntityManager getManager()
	{
		if (manager!= null)	//there is one already
			return manager;	//just return it
			//if there is none, create, store it, and return
			EntityManagerFactory factory = Persistence.createEntityManagerFactory("transactions-optional");
			manager = factory.createEntityManager();
			return manager;
	} //end of method
	
	public void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
		try	{
			String patientname = req.getParameter("patientname");
		    String gp = req.getParameter("gp");
		    Long longDateTime = Long.parseLong(req.getParameter("longDateTime"));
		    Long tolongDateTime = longDateTime + (15*60*1000);
		    boolean apointmentgoahead = false;
		
		    Appointment appointment = new Appointment (patientname, gp, longDateTime);
		    if(apointmentgoahead = true){
		    saveAppointment(appointment);
		    resp.setStatus(201); //return code 201 Created (everything ok)
			resp.getWriter().print("To-do saved.");
		    }
		    resp.setContentType("application/json");
		    
			EntityManager manager=getManager();	//get an EntityManager
			manager.getTransaction().begin();	//begin transaction
			String myqueryString="select a from Appointment a where a.gpName=\""+gp+"\" and a.dateTime  >= "+longDateTime+"  and a.dateTime <= "+tolongDateTime;
			Query myquery= manager.createQuery(myqueryString);
			List<Appointment> myresult=(List<Appointment>)myquery.getResultList();
			if(myresult.size()!=0){
				resp.sendError(404,"Appointment already exists for that day");//error occurred e.g parameters not found	
				resp.getWriter().print("Appointment already exists for that day");
				apointmentgoahead = false;
			}
			if(gp == ""){
				
				String thequeryString="select a.gpName from Appointment  where not (a.dateTime  >= "+longDateTime+"  and a.dateTime <= "+tolongDateTime+")";
				Query thequery= manager.createQuery(thequeryString);
				List<String> theresult = (List<String>)thequery.getResultList();	
				int index = (int)Math.floor(Math.random()*theresult.size());
				gp  = theresult.get(index);
			}
			if (patientname == ""){
				resp.sendError(404,"Appointment can't be created without a patient name");
				resp.getWriter().print("Appointment can't be created without a patient name");
				apointmentgoahead = false;
			}


			Calendar calendar = Calendar.getInstance();
			calendar.setTimeInMillis(longDateTime);
			int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
			int hours = calendar.get(Calendar.HOUR_OF_DAY);
			int minutes = calendar.get(Calendar.MINUTE);

			if(!(dayOfWeek >= 1 && dayOfWeek <= 5 && hours <= 17 && (hours > 8 || hours == 8 && minutes >= 30))){
				if (hours >=12 && hours <= 13){
					resp.sendError(404,"Error: Clinic is not open on this date");
					resp.getWriter().print("Error: Clinic is not open on this date");
					apointmentgoahead = false;
					}
				}
			manager.getTransaction().commit();	//end transaction
			} 
		catch (Exception e){
			resp.sendError(400,e.toString());//error occurred e.g parameters not found
			}
	} //end method

	public void saveAppointment (Appointment appointment)
	{
		EntityManager manager = getManager();//get an EntityManager
		manager.getTransaction().begin();	//begin transaction
		manager.persist(appointment);
		manager.getTransaction().commit();	//end transaction
	} //end method

	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
	try	{
		// get the gpnames from the class Ugr by creating an instance of the class
		Ugr gpnames = new Ugr();
		resp.setContentType("application/json");
		resp.setStatus(201); //return code 201 Created (everything ok)
		resp.getWriter().print(new Gson().toJson(gpnames.GP_NAMES));
		}
	catch (Exception e){
		resp.sendError(400,e.toString());	//return code 400, error occurred	
		}
	} //end method
}
