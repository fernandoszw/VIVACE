using Microsoft.AspNetCore.Mvc;
using QRCoder;
using System.Text;
using Vivace.Context;
using Vivace.Models;
using VIVACE.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PixController : ControllerBase
    {
        private readonly FinancasContext _context;

        public PixController(FinancasContext context)
        {
            _context = context;
        }

        // ===================== 1️⃣ LISTAR CHAVES =====================
        [HttpGet("keys")]
        public IActionResult GetPixKeys()
        {
            try
            {
                var keys = _context.PixKeys.ToList();
                return Ok(keys);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao buscar chaves PIX: {ex.Message}" });
            }
        }

        // ===================== 2️⃣ CADASTRAR CHAVE =====================
        [HttpPost("register")]
        public IActionResult RegisterKey([FromBody] PixKey key)
        {
            try
            {
                if (key == null || string.IsNullOrEmpty(key.Tipo) || string.IsNullOrEmpty(key.Valor))
                    return BadRequest(new { message = "Tipo e valor da chave são obrigatórios." });

                _context.PixKeys.Add(key);
                _context.SaveChanges();
                return Ok(new { message = "Chave PIX cadastrada com sucesso!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao cadastrar chave: {ex.Message}" });
            }
        }

        // ===================== 3️⃣ GERAR PAYLOAD + QR CODE =====================
        [HttpGet("payload")]
        public IActionResult GetPixPayload([FromQuery] int? keyId, [FromQuery] string rawKey,
                                           [FromQuery] decimal? amount, [FromQuery] string txid,
                                           [FromQuery] string desc)
        {
            try
            {
                string chave;
                string nome;
                string cidade;

                if (keyId.HasValue)
                {
                    var key = _context.PixKeys.FirstOrDefault(k => k.Id == keyId.Value);
                    if (key == null) return NotFound(new { message = "Chave não encontrada." });

                    chave = key.Valor;
                    nome = key.Nome ?? "VIVACE";
                    cidade = key.Cidade ?? "SAO PAULO";
                }
                else
                {
                    chave = rawKey;
                    nome = "VIVACE";
                    cidade = "SAO PAULO";
                }

                var payload = BuildPixPayload(chave, nome, cidade, amount, txid, desc);

                using (var qrGenerator = new QRCodeGenerator())
                {
                    var qrData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q);
                    var qrCode = new PngByteQRCode(qrData);
                    var qrBytes = qrCode.GetGraphic(20);
                    var base64 = $"data:image/png;base64,{Convert.ToBase64String(qrBytes)}";

                    return Ok(new { payload, qrBase64 = base64 });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Erro ao gerar QR: {ex.Message}" });
            }
        }

        // ===================== 4️⃣ FUNÇÃO DE PAYLOAD =====================
        private string BuildPixPayload(string chave, string nome, string cidade, decimal? amount, string txid, string desc)
        {
            string tlv(string id, string value)
            {
                var v = value ?? "";
                return id + v.Length.ToString("D2") + v;
            }

            var gui = tlv("00", "br.gov.bcb.pix");
            var chaveTag = tlv("01", chave);
            var merchantAccount = tlv("26", gui + chaveTag);
            var payload = tlv("00", "01") + merchantAccount +
                          tlv("52", "0000") +
                          tlv("53", "986") +
                          (amount.HasValue ? tlv("54", amount.Value.ToString("F2")) : "") +
                          tlv("58", "BR") +
                          tlv("59", nome) +
                          tlv("60", cidade) +
                          tlv("62", tlv("05", txid ?? "")) +
                          "6304"; // placeholder for CRC

            string crc = CRC16(payload);
            return payload + crc;
        }

        private static string CRC16(string input)
        {
            ushort crc = 0xFFFF;
            foreach (char c in input)
            {
                crc ^= (ushort)(c << 8);
                for (int i = 0; i < 8; i++)
                    crc = (ushort)((crc & 0x8000) != 0 ? (crc << 1) ^ 0x1021 : crc << 1);
            }
            return crc.ToString("X4");
        }
    }
}
