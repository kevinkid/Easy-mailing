using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace EasyMail.Controllers
{
    public class itemsController : ApiController
    {
        static HttpClient client = new HttpClient();

        // GET api/<controller>/5
        [EnableCors(origins: "http://*", headers: "*", methods: "GET")]
        [HttpGet]
        public string GetDefinitionAsync()
        {
            Task<string> content = client.GetStringAsync("https://googe.com");
            return content.Result.ToString();
        }

        // POST api/<controller>
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<controller>/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<controller>/5
        public void Delete(int id)
        {
        }
    }
}