package cmm529.cw;

import java.text.SimpleDateFormat;
import java.util.*;					//to use the java util classes
import java.io.IOException;			//for exception handling

import javax.servlet.http.*;		//to use HTTP servlet

import cmm529.clinic.Appointment;	//to use the Appointment class

import com.google.gson.*;			//to use the Gson class to generate JSON data

import javax.persistence.*;			//to use JPA

@SuppressWarnings("serial")
public class EditAppointmmentServlet extends HttpServlet{
	private  EntityManager manager=null;	//the reusable EntityManager stored in the servlet
	// use this method to get an EntityManager
	// It creates if there is none, or reuse if there is already one.
	public EntityManager getManager()
	{
		if (manager!=null)	//there is one already
			return manager;	//just return it
			//if there is none, create, store it, and return
			EntityManagerFactory factory=Persistence.createEntityManagerFactory("transactions-optional");
			manager=factory.createEntityManager();
			return manager;
	} //end method
	
	public void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
		try	{
			String patientname = req.getParameter("patientname");
			Iterable<Appointment> appointments = getAppointments(patientname);
			resp.setContentType("application/json");			        //set content-type to JSON
			resp.setStatus(201); //return code 201 Created (everything ok)
			resp.getWriter().println(new Gson().toJson(appointments));	//output JSON string to client
		
				
		}
		catch (NoResultException e)	//no appointment with parameter found
			{
			resp.sendError(404,e.toString());
			}
		catch (Exception e)	//other exception
			{
			resp.sendError(400,e.toString());
			}
	} //end method

	public Iterable<Appointment> getAppointments(String pName)
	{
		EntityManager manager = getManager();	//get an EntityManager
		manager.getTransaction().begin();	//begin transaction
		String queryString = "select a from Appointment a where a.patientName=\""+pName+"\"";
		Query query= manager.createQuery(queryString);
		List<Appointment> result = (List<Appointment>)query.getResultList();
		manager.getTransaction().commit();	//end transaction
		//System.out.print(result);
		return result;
		} //end method
	
	
	public void doPut(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
		EntityManager manager=getManager();									//get an EntityManager
		try	{
			Long id= Long.parseLong(req.getParameter("id"));				//get ID from URL path, removing first slash character
			Long longDateTime = Long.parseLong(req.getParameter("longDateTime"));//get longDateTime parameter value
			Long tolongDateTime = longDateTime + (15*60*1000);
			String gp =req.getParameter("gp");
			boolean apointmentgoahead = true;
			manager.getTransaction().begin();
			Appointment appointment = manager.find(Appointment.class,id);	//get an object by its ID
			if (appointment==null)	//if nothing is retrieved by ID
				{
				System.out.println("Cannot find ID to update");
				throw new Exception("ID not found to update");
				}
			if(apointmentgoahead = true){
				appointment.setGpName(gp); 
				appointment.setDateTime(longDateTime);
				appointment.setId(id);
				resp.setStatus(200); //return code 200 Created (everything ok)
				System.out.println("Updated");
			 }
			
			if(gp == ""){
				String thequeryString="select a.gpName from Appointment  where not (a.dateTime  >= "+longDateTime+"  and a.dateTime <= "+tolongDateTime+")";
				Query thequery= manager.createQuery(thequeryString);
				List<String> theresult = (List<String>)thequery.getResultList();	
				int index = (int)Math.floor(Math.random()*theresult.size());
				gp  = theresult.get(index);
						}
			String myqueryString="select a from Appointment a where a.gpName=\""+gp+"\" and a.dateTime  >= "+longDateTime+"  and a.dateTime <= "+tolongDateTime;
			Query myquery= manager.createQuery(myqueryString);
			List<Appointment> myresult=(List<Appointment>)myquery.getResultList();
			if(myresult.size()!=0){
			resp.sendError(404);//error occurred e.g parameters not found
			apointmentgoahead = false;
			}
			Calendar calendar = Calendar.getInstance();
			calendar.setTimeInMillis(longDateTime);
			
			int mYear = calendar.get(Calendar.YEAR);
			int mMonth = calendar.get(Calendar.MONTH);
			int mDay = calendar.get(Calendar.DAY_OF_MONTH);
			int dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK);
			int hours = calendar.get(Calendar.HOUR_OF_DAY);
			int minutes = calendar.get(Calendar.MINUTE);

			if(!(dayOfWeek >= 1 && dayOfWeek <= 5 && hours <= 17 && (hours > 8 || hours == 8 && minutes >= 30))){
				if (hours >=12 && hours <= 13){
					resp.sendError(400,"Error: Clinic is not open on this date");
					apointmentgoahead = false;
					}
				}
			manager.getTransaction().commit();	//commit transaction
			 
		}
		catch (Exception e){
			manager.getTransaction().rollback();	//rollback transaction
			System.out.println(e.toString());		//something goes wrong
			resp.sendError(404,e.toString());		//report to client
			e.printStackTrace();
		}
	} //end method
	
	public void doDelete(HttpServletRequest req, HttpServletResponse resp) throws IOException
	{
	try	{
		Long id = new Long(req.getPathInfo().substring(1));		//get ID from URL path, removing 1st character of slash
		deleteAppointment(id);
		resp.setStatus(204);						//set reply status code (everything ok)
		} 
	catch (Exception e){							//no Appointment with ID found	
		resp.sendError(404,e.toString());
		e.printStackTrace();
		}
	} //end method

	public void deleteAppointment(Long id)
	{
		EntityManager manager = getManager();
		manager.getTransaction().begin();	//begin transaction
		Appointment appointment=(Appointment)manager.find(Appointment.class,id);	//retrieve a ToDo using its ID
		manager.remove(appointment);	//delete object from GAE DS
		manager.getTransaction().commit();	//commit transaction
	} //end method
}
