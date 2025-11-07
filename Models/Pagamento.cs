
namespace Vivace.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public int MoradorId { get; set; }  // referência do morador
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
        public string QrCode { get; set; }
        public string QrCodeBase64 { get; set; }
        public string ExternalReference { get; set; } // usado pra conciliar com o Mercado Pago
        public bool Pago { get; set; } = false;
        public DateTime DataCriacao { get; set; } = DateTime.Now;
    }
}