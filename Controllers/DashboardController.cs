using Microsoft.AspNetCore.Mvc;
using System.Linq;
using System.Threading.Tasks;
using Vivace.DTOs;
using Vivace.Interfaces;
using Vivace.Models;
using VIVACE.DTOs;
using VIVACE.Models;

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

        [HttpGet("meses")]
        public async Task<IActionResult> ObterMeses()
        {
            var dashboards = await _dashboardService.ObterTodosMesesAsync();
            var result = dashboards.Select(d => new DashBoardResumoDto
            {
                Id = d.Id,
                Mes = d.Mes,
                Ano = d.Ano,
                Receita = d.Receita,
                Despesa = d.Despesa,
                Taxa = d.Taxa,
                Despesas = d.Despesas.Select(x => new DespesaDto
                {
                    Id = x.Id,
                    Nome = x.Nome,
                    Valor = x.Valor
                }).ToList()
            }).ToList();

            return Ok(result);
        }

        [HttpPost("adicionar")]
        public async Task<IActionResult> AdicionarMes([FromBody] DashboardCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest("Dados inválidos");

            var mesNumero = MesParaNumero(dto.Mes);
            var dashboard = new Dashboard
            {
                Mes = dto.Mes,
                Ano = dto.Ano,
                Receita = dto.Receita,
                Despesa = dto.Despesa,
                Taxa = dto.Taxa,
                MesNumero = mesNumero
            };

            var result = await _dashboardService.AdicionarMesAsync(dashboard);
            return Ok(result);
        }

        [HttpPost("adicionar-despesa/{dashboardId}")]
        public async Task<IActionResult> AdicionarDespesa(int dashboardId, [FromBody] DespesaCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest("Despesa inválida");

            try
            {
                var despesa = new Despesa
                {
                    Nome = dto.Nome,
                    Valor = dto.Valor
                };

                var result = await _dashboardService.AdicionarDespesaAsync(dashboardId, despesa);
                return Ok(new DespesaDto
                {
                    Id = result.Id,
                    Nome = result.Nome,
                    Valor = result.Valor
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("remover/{id}")]
        public async Task<IActionResult> RemoverMes(int id)
        {
            var success = await _dashboardService.RemoverMesAsync(id);
            if (!success) return NotFound();
            return Ok();
        }

        private int MesParaNumero(string mes)
        {
            return mes.ToLower() switch
            {
                "janeiro" => 1,
                "fevereiro" => 2,
                "março" => 3,
                "abril" => 4,
                "maio" => 5,
                "junho" => 6,
                "julho" => 7,
                "agosto" => 8,
                "setembro" => 9,
                "outubro" => 10,
                "novembro" => 11,
                "dezembro" => 12,
                _ => 0
            };
        }
    }
}
