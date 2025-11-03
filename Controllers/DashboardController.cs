using Microsoft.AspNetCore.Mvc;
using Vivace.Interfaces;
using Vivace.Models;
using System.Threading.Tasks;
using VIVACE.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _service;

        public DashboardController(IDashboardService service)
        {
            _service = service;
        }

        [HttpGet("meses")]
        public async Task<IActionResult> ObterMeses()
        {
            var meses = await _service.ObterTodosMesesAsync();
            return Ok(meses);
        }

        [HttpPost("adicionar")]
        public async Task<IActionResult> AdicionarMes(Dashboard dashboard)
        {
            var d = await _service.AdicionarMesAsync(dashboard);
            return Ok(d);
        }

        [HttpPost("adicionar-despesa/{dashboardId}")]
        public async Task<IActionResult> AdicionarDespesa(int dashboardId, Despesa despesa)
        {
            try
            {
                var d = await _service.AdicionarDespesaAsync(dashboardId, despesa);
                return Ok(d);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("remover/{dashboardId}")]
        public async Task<IActionResult> RemoverMes(int dashboardId)
        {
            var result = await _service.RemoverMesAsync(dashboardId);
            if (!result) return NotFound();
            return Ok();
        }
    }
}
