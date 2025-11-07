using Microsoft.AspNetCore.Mvc;
using MercadoPago.Config;
using MercadoPago.Client.Payment;
using MercadoPago.Resource.Payment;
using Vivace.Context;
using Vivace.Models;
using Microsoft.EntityFrameworkCore;
using VIVACE.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PixController : ControllerBase
    {
        private readonly FinancasContext _context;
        private readonly IConfiguration _config;

        public PixController(FinancasContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        // ==================== [1] CRIAR PIX ====================
        [HttpPost("criar")]
        public async Task<IActionResult> CriarPix([FromBody] QrRequest request)
        {
            try
            {
                string accessToken = _config["MercadoPago:AccessToken"]!;
                MercadoPagoConfig.AccessToken = accessToken;

                var paymentRequest = new PaymentCreateRequest
                {
                    TransactionAmount = request.Amount ?? 0m,
                    Description = request.Descricao ?? "Pagamento Vivace",
                    PaymentMethodId = "pix",
                    Payer = new PaymentPayerRequest
                    {
                        Email = request.Email ?? "teste@vivace.com"
                    }
                };

                var client = new PaymentClient();
                Payment payment = await client.CreateAsync(paymentRequest);

                var pagamento = new Pagamento
                {
                    MoradorId = request.MoradorId,
                    Descricao = request.Descricao ?? "Pagamento PIX",
                    Valor = request.Amount ?? 0m,
                    QrCode = payment.PointOfInteraction?.TransactionData?.QrCode ?? "",
                    QrCodeBase64 = payment.PointOfInteraction?.TransactionData?.QrCodeBase64 ?? "",
                    ExternalReference = payment.Id.ToString() ?? ""
                };

                _context.Pagamentos.Add(pagamento);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    pagamento.Id,
                    pagamento.MoradorId,
                    pagamento.Descricao,
                    pagamento.Valor,
                    pagamento.QrCodeBase64,
                    pagamento.ExternalReference
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao criar PIX: {ex.Message}" });
            }
        }

        // ==================== [2] LISTAR PIX POR MORADOR ====================
        [HttpGet("morador/{id}")]
        public async Task<IActionResult> ListarPixMorador(int id)
        {
            try
            {
                var pix = await _context.Pagamentos
                    .Where(p => p.MoradorId == id)
                    .OrderByDescending(p => p.DataCriacao)
                    .Select(p => new
                    {
                        p.Id,
                        p.Descricao,
                        p.Valor,
                        p.Pago,
                        p.DataCriacao,
                        p.QrCodeBase64,
                        p.ExternalReference
                    })
                    .ToListAsync();

                if (!pix.Any())
                    return NotFound(new { message = "Nenhum pagamento PIX encontrado para este morador." });

                return Ok(pix);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao listar PIX: {ex.Message}" });
            }
        }

        // ==================== [3] CONSULTAR STATUS PIX ====================
        [HttpGet("status/{externalReference}")]
        public async Task<IActionResult> ConsultarStatus(string externalReference)
        {
            try
            {
                string accessToken = _config["MercadoPago:AccessToken"]!;
                MercadoPagoConfig.AccessToken = accessToken;

                var client = new PaymentClient();
                var payment = await client.GetAsync(long.Parse(externalReference));

                var pagamento = await _context.Pagamentos.FirstOrDefaultAsync(p => p.ExternalReference == externalReference);
                if (pagamento == null)
                    return NotFound(new { message = "Pagamento não encontrado no banco." });

                pagamento.Pago = payment.Status == "approved";
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    pagamento.Id,
                    pagamento.Descricao,
                    pagamento.Valor,
                    Status = payment.Status,
                    pagamento.Pago
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao consultar status: {ex.Message}" });
            }
        }

        // ==================== [4] WEBHOOK ====================
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook([FromBody] dynamic payload)
        {
            try
            {
                string type = payload.type;
                string id = payload.data.id;

                if (type != "payment") return Ok(); // Ignora outros eventos

                string accessToken = _config["MercadoPago:AccessToken"]!;
                MercadoPagoConfig.AccessToken = accessToken;

                var client = new PaymentClient();
                var payment = await client.GetAsync(long.Parse(id));

                var pagamento = await _context.Pagamentos
                    .FirstOrDefaultAsync(p => p.ExternalReference == payment.Id.ToString());

                if (pagamento != null)
                {
                    pagamento.Pago = payment.Status == "approved";
                    await _context.SaveChangesAsync();
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro no webhook: {ex.Message}" });
            }
        }
    }
}
