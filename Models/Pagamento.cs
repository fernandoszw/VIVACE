namespace Vivace.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public string NomeConta { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime Vencimento { get; set; }
        public string Metodo { get; set; } = "PIX";
        public string Status { get; set; } = "Pendente";
        public string TxId { get; set; } = string.Empty;
    }
}
