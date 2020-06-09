package cmm529.cw;
import java.util.*;
import java.io.IOException;

import javax.servlet.http.*;			//to use HTTP servlet

import cmm529.clinic.Appointment;

import com.google.gson.*;			//to use the Gson class to generate JSON data

import javax.persistence.*;			//to use JPA
				//to use the Date class

@SuppressWarnings("serial")
public class EditGPAppointmentServlet extends HttpServlet{
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
			String gpname =req.getParameter("gpname");
			Long from = Long.parseLong(req.getParameter("from"));
			Long to = Long.parseLong(req.getParameter("to"));
			Iterable<Appointment> gpappointments= getAppointmentForGp(gpname,from,to);			   
			//set content-type to JSON
			resp.setContentType("application/json");
			resp.setStatus(201); //return code 201 Created (everything ok)
			resp.getWriter().println(new Gson().toJson(gpappointments));
			}
		catch (Exception e)	//other exception
			{
			resp.getWriter().print(e.toString());
			resp.sendError(400,e.toString());	//return code 400, error occurred	
			e.printStackTrace();
			}
	} //end method

	
	public Iterable<Appointment> getAppointmentForGp(String gpName, Long from, Long to)
	{
		EntityManager manager=getManager();	//get an EntityManager
		manager.getTransaction().begin();	//begin transaction
		String queryString="select a from Appointment a where a.gpName=\""+gpName+"\" and a.dateTime  >= "+from+"  and a.dateTime <= "+to;
		Query query= manager.createQuery(queryString);
		List<Appointment> result=(List<Appointment>)query.getResultList();
		manager.getTransaction().commit();	//end transaction
		return result;
	}

}
