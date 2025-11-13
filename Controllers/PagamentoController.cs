using Microsoft.AspNetCore.Mvc;
using Vivace.DTOs;
using Vivace.Interfaces;
using Vivace.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PagamentoController : ControllerBase
    {
        private readonly IPagamentoService _svc;

        public PagamentoController(IPagamentoService svc)
        {
            _svc = svc;
        }

        [HttpPost("gerar")]
        public async Task<IActionResult> Gerar([FromBody] Pagamento pagamento)
        {
            if (pagamento == null || pagamento.Valor <= 0)
                return BadRequest("Dados inválidos.");

            var dto = await _svc.RegistrarPagamentoAsync(pagamento);
            if (!dto.Sucesso) return BadRequest("Falha ao gerar QR");
            return Ok(dto);
        }

        [HttpGet("listar")]
        public async Task<IActionResult> Listar()
        {
            var pagamentos = await _svc.ListarPagamentosAsync();
            return Ok(pagamentos);
        }

        [HttpPut("confirmar/{id}")]
        public async Task<IActionResult> Confirmar(int id)
        {
            var ok = await _svc.ConfirmarPagamentoAsync(id);
            if (!ok) return NotFound();
            return Ok(new { mensagem = "Pago" });
        }
    }
}
