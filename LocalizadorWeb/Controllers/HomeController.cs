using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using LocalizadorWeb.Models;
using RestSharp;

namespace LocalizadorWeb.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public ActionResult BuscarAmigos(string Usuario)
        {
            var client = new RestClient("http://localhost:54426/API/Values?Usuario=" + Usuario);
            client.Timeout = 0;
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Json(new { response = response.Content });
        }


        [HttpPost]
        public ActionResult BuscarUsuarios()
        {
            var client = new RestClient("http://localhost:54426/API/Values");
            client.Timeout = 0;
            var request = new RestRequest(Method.GET);
            IRestResponse response = client.Execute(request);
            return Json(new { response = response.Content });
        }

    }
}