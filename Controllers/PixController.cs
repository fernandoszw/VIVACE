using Microsoft.AspNetCore.Mvc;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PixController : ControllerBase
    {
        [HttpPost("gerar")]
        public IActionResult GerarPix([FromBody] PixRequest req)
        {
            try
            {
                // 🔹 Dados do PIX
                string chavePix = "vivace@condominio.com"; // sua chave real
                string nome = "Vivace Condominio";
                string cidade = "SAO PAULO";
                string valor = req.Valor.ToString("0.00").Replace(",", ".");
                string descricao = req.Descricao ?? "Pagamento";
                string txid = Guid.NewGuid().ToString().Substring(0, 10);

                // 🔹 Monta o código EMV do Banco Central (PIX Copia e Cola)
                string emv = MontarEMVPix(chavePix, nome, cidade, valor, descricao, txid);

                // 🔹 Gera o QR Code em Base64 (imagem)
                var qrBase64 = GerarQRCodeBase64(emv);

                // 🔹 Retorna para o front
                return Ok(new
                {
                    qrCode = emv,
                    qrCodeBase64 = qrBase64,
                    valor = valor,
                    descricao = descricao,
                    nome = nome,
                    cidade = cidade
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { erro = ex.Message });
            }
        }

        // ✅ Monta código PIX completo (EMV)
        private string MontarEMVPix(string chave, string nome, string cidade, string valor, string descricao, string txid)
        {
            string emv = "000201"; // cabeçalho
            emv += "26360014br.gov.bcb.pix"; // domínio do Banco Central
            emv += "0114" + chave.Length.ToString("D2") + chave; // chave
            if (!string.IsNullOrEmpty(descricao))
                emv += "02" + descricao.Length.ToString("D2") + descricao; // descrição
            emv += "52040000"; // código adicional
            emv += "5303986"; // moeda (986 = BRL)
            emv += "540" + valor.Length.ToString("D2") + valor; // valor
            emv += "5802BR"; // país
            emv += "590" + nome.Length.ToString("D2") + nome; // nome
            emv += "600" + cidade.Length.ToString("D2") + cidade; // cidade
            emv += "62070503***"; // txid
            string crc16 = CalcularCRC16(emv + "6304");
            emv += "6304" + crc16;
            return emv;
        }

        // ✅ Calcula CRC16 para PIX
        private string CalcularCRC16(string input)
        {
            ushort polynomial = 0x1021;
            ushort crc = 0xFFFF;

            foreach (byte b in System.Text.Encoding.ASCII.GetBytes(input))
            {
                crc ^= (ushort)(b << 8);
                for (int i = 0; i < 8; i++)
                {
                    if ((crc & 0x8000) != 0)
                        crc = (ushort)((crc << 1) ^ polynomial);
                    else
                        crc <<= 1;
                }
            }

            return crc.ToString("X4");
        }

        // ✅ Gera imagem Base64 do QR Code (sem dependência externa)
        private string GerarQRCodeBase64(string texto)
        {
            var qrGen = new ZXing.BarcodeWriterPixelData
            {
                Format = ZXing.BarcodeFormat.QR_CODE,
                Options = new ZXing.Common.EncodingOptions
                {
                    Height = 300,
                    Width = 300,
                    Margin = 1
                }
            };

            var pixelData = qrGen.Write(texto);
            using var bitmap = new Bitmap(pixelData.Width, pixelData.Height, System.Drawing.Imaging.PixelFormat.Format32bppRgb);
            var bitmapData = bitmap.LockBits(new Rectangle(0, 0, pixelData.Width, pixelData.Height),
                                             System.Drawing.Imaging.ImageLockMode.WriteOnly,
                                             System.Drawing.Imaging.PixelFormat.Format32bppRgb);
            try
            {
                System.Runtime.InteropServices.Marshal.Copy(pixelData.Pixels, 0, bitmapData.Scan0, pixelData.Pixels.Length);
            }
            finally
            {
                bitmap.UnlockBits(bitmapData);
            }

            using var ms = new MemoryStream();
            bitmap.Save(ms, ImageFormat.Png);
            return "data:image/png;base64," + Convert.ToBase64String(ms.ToArray());
        }
    }

    public class PixRequest
    {
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
    }
}
