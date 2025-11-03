using Microsoft.AspNetCore.Mvc;
using Vivace.DTOs;
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

        [HttpGet("todos")]
        public async Task<IActionResult> GetResumo()
        {
            var resumo = await _dashboardService.ObterTodosMesesAsync();
            return Ok(resumo);
        }

        [HttpPost("adicionar-mes")]
        public async Task<IActionResult> AdicionarMes([FromBody] DashBoardResumoDto mes)
        {
            var resultado = await _dashboardService.AdicionarMesAsync(mes);
            return Ok(resultado);
        }

        [HttpDelete("remover-mes")]
        public async Task<IActionResult> RemoverMes([FromQuery] string mes, [FromQuery] int ano)
        {
            await _dashboardService.RemoverMesAsync(mes, ano);
            return NoContent();
        }

        [HttpGet("despesas")]
        public async Task<IActionResult> ObterDespesas([FromQuery] string mes, [FromQuery] int ano)
        {
            var despesas = await _dashboardService.ObterDespesasPorMesAsync(mes, ano);
            return Ok(despesas);
        }

        [HttpPost("adicionar-despesa")]
        public async Task<IActionResult> AdicionarDespesa([FromQuery] string mes, [FromQuery] int ano, [FromBody] DespesaDto despesaDto)
        {
            await _dashboardService.AdicionarDespesaAsync(mes, ano, despesaDto);
            return Ok(despesaDto);
        }
    }
}
