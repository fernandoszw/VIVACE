using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.Models;
using Vivace.DTOs;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using VIVACE.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly FinancasContext _context;

        public DashboardController(FinancasContext context)
        {
            _context = context;
        }

        // GET: api/dashboard/meses
        [HttpGet("meses")]
        public async Task<IActionResult> ObterMeses()
        {
            var dashboards = await _context.Dashboards
                .Include(d => d.Despesas)
                .ToListAsync();

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

        // POST: api/dashboard/adicionar
        [HttpPost("adicionar")]
        public async Task<IActionResult> AdicionarMes([FromBody] Dashboard dashboard)
        {
            if (dashboard == null)
                return BadRequest(new { message = "Dados inválidos" });

            _context.Dashboards.Add(dashboard);
            await _context.SaveChangesAsync();
            return Ok(dashboard);
        }

        // POST: api/dashboard/adicionar-despesa/{dashboardId}
        [HttpPost("adicionar-despesa/{dashboardId}")]
        public async Task<IActionResult> AdicionarDespesa(int dashboardId, [FromBody] DespesaDto despesaDto)
        {
            if (despesaDto == null || despesaDto.Valor <= 0)
                return BadRequest(new { message = "Despesa inválida" });

            var dashboard = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == dashboardId);

            if (dashboard == null)
                return NotFound(new { message = "Mês não encontrado" });

            var novaDespesa = new Despesa
            {
                Nome = despesaDto.Nome,
                Valor = despesaDto.Valor,
                MesNumero = dashboard.MesNumero,
                Ano = dashboard.Ano,
                DashboardId = dashboard.Id
            };

            dashboard.Despesas.Add(novaDespesa);
            dashboard.Despesa = dashboard.Despesas.Sum(d => d.Valor);

            _context.Update(dashboard);
            await _context.SaveChangesAsync();

            return Ok(new DespesaDto
            {
                Id = novaDespesa.Id,
                Nome = novaDespesa.Nome,
                Valor = novaDespesa.Valor
            });
        }

        // DELETE: api/dashboard/remover/{id}
        [HttpDelete("remover/{id}")]
        public async Task<IActionResult> RemoverMes(int id)
        {
            var dashboard = await _context.Dashboards.FindAsync(id);
            if (dashboard == null)
                return NotFound();

            _context.Dashboards.Remove(dashboard);
            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}
