using Vivace.Models;
using Vivace.DTOs;
using Vivace.Interfaces;
using Vivace.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QRCoder;
using System.Text;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Service
{
    public class PagamentoService : IPagamentoService
    {
        private readonly FinancasContext _ctx;
        private readonly IConfiguration _cfg;

        public PagamentoService(FinancasContext ctx, IConfiguration cfg)
        {
            _ctx = ctx;
            _cfg = cfg;
        }

        public async Task<PagamentoResultDto> RegistrarPagamentoAsync(Pagamento pagamento)
        {
            pagamento.TxId = Guid.NewGuid().ToString("N").Substring(0, 25);
            pagamento.Status = "Pendente";
            pagamento.Vencimento = DateTime.UtcNow.AddDays(1);

            _ctx.Pagamentos.Add(pagamento);
            await _ctx.SaveChangesAsync();

            // QR Code (simulado EMV)
            string chavePix = _cfg["Pix:Chave"];
            string nomeComercio = _cfg["Pix:NomeComercio"];
            string cidade = _cfg["Pix:CidadeComercio"];
            string valorTexto = pagamento.Valor.ToString("F2", System.Globalization.CultureInfo.InvariantCulture);

            string payload = PixBuilder.CriarPayload(chavePix, nomeComercio, cidade, valorTexto, pagamento.TxId);

            string base64;
            using (var qrGenerator = new QRCodeGenerator())
            using (var qrData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.M))
            using (var qrCode = new PngByteQRCode(qrData))
            {
                base64 = Convert.ToBase64String(qrCode.GetGraphic(12));
            }

            return new PagamentoResultDto
            {
                Sucesso = true,
                QrCodeBase64 = base64,
                PixCopiaCola = payload,
                TxId = pagamento.TxId,
                Nome = pagamento.NomeConta,
                Valor = pagamento.Valor,
                Vencimento = pagamento.Vencimento,
                Descricao = pagamento.NomeConta
            };
        }

        public async Task<IEnumerable<Pagamento>> ListarPagamentosAsync()
        {
            return await _ctx.Pagamentos.OrderBy(p => p.Vencimento).ToListAsync();
        }

        public async Task<bool> ConfirmarPagamentoAsync(int id)
        {
            var p = await _ctx.Pagamentos.FindAsync(id);
            if (p == null) return false;

            p.Status = "Pago";
            await _ctx.SaveChangesAsync();
            return true;
        }

        internal static class PixBuilder
        {
            public static string CriarPayload(string chave, string merchantName, string merchantCity, string amount, string txid)
            {
                string Add(string id, string v) => $"{id}{v.Length:D2}{v}";
                var sb = new StringBuilder();
                sb.Append(Add("00", "01"));
                var mai = new StringBuilder();
                mai.Append("0014BR.GOV.BCB.PIX");
                mai.Append(Add("01", chave));
                sb.Append(Add("26", mai.ToString()));
                sb.Append(Add("52", "0000"));
                sb.Append(Add("53", "986"));
                if (!string.IsNullOrEmpty(amount)) sb.Append(Add("54", amount));
                sb.Append(Add("58", "BR"));
                sb.Append(Add("59", merchantName.Length > 25 ? merchantName.Substring(0, 25) : merchantName));
                sb.Append(Add("60", merchantCity.Length > 15 ? merchantCity.Substring(0, 15) : merchantCity));
                sb.Append(Add("62", Add("05", Add("01", txid))));
                var semCrc = sb.ToString();
                var crc = CalcularCRC16(semCrc + "6304");
                return semCrc + "6304" + crc.ToString("X4");
            }

            private static ushort CalcularCRC16(string texto)
            {
                var dados = Encoding.ASCII.GetBytes(texto);
                ushort crc = 0xFFFF;
                foreach (var b in dados)
                {
                    crc ^= (ushort)(b << 8);
                    for (int i = 0; i < 8; i++)
                        crc = (ushort)(((crc & 0x8000) != 0) ? (crc << 1) ^ 0x1021 : (crc << 1));
                }
                return crc;
            }
        }
    }
}
