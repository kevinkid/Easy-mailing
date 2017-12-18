using System.Web.Mvc;

namespace EasyMail.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Compose()
        {
            ViewBag.Title = "Email Compose";
            ViewBag.editing = Request["editing"];
            ViewBag.Message = Request["draft"];
            return View();
        }

        public ActionResult Index()
        {
            ViewBag.Title = "Home Page";
            ViewBag.editing = Request["editing"];
            return View();
        }
    }
}