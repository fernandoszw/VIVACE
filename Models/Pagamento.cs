using System;

namespace Vivace.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string QrCode { get; set; } = string.Empty;
        public bool Pago { get; set; } = false;
        public DateTime DataCriacao { get; set; } = DateTime.Now;
    }
}
