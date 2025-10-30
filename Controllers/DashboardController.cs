using Microsoft.AspNetCore.Mvc;
using Vivace.Service;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        [HttpGet("resumo")]
        public async Task<IActionResult> GetResumo()
        {
            var resumo = await _dashboardService.ObterResumoAsync();
            return Ok(resumo);
        }

        [HttpGet("evolucao")]
        public async Task<IActionResult> GetEvolucao()
        {
            var evolucao = await _dashboardService.ObterEvolucaoFinanceiraAsync();
            return Ok(evolucao);
        }
    }
}
