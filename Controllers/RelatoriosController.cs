using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Vivace.Service;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly IRelatorioService _relatorioService;
        public RelatoriosController(IRelatorioService relatorioService)
        {
            _relatorioService = relatorioService;
        }


        [HttpGet("balancete")]
        public async Task<IActionResult> GetBalancete([FromQuery] int mes, [FromQuery] int ano)
        {
            var bytes = await _relatorioService.GerarBalancetePdfAsync(mes, ano);
            return File(bytes, "application/pdf", $"balancete-{mes}-{ano}.pdf");
        }


        [HttpGet("inadimplencia/excel")]
        public async Task<IActionResult> GetInadimplenciaExcel()
        {
            var bytes = await _relatorioService.GerarInadimplenciaExcelAsync();
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "inadimplencia.xlsx");
        }


        [HttpGet("inadimplencia")]
        public async Task<IActionResult> GetInadimplencia()
        {
            var list = await _relatorioService.ObterInadimplenciaAsync();
            return Ok(list);
        }
    }
}
