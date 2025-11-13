namespace Vivace.DTOs
{
    public class PagamentoResultDto
    {
        public bool Sucesso { get; set; }
        public string QrCodeBase64 { get; set; } = string.Empty;
        public string PixCopiaCola { get; set; } = string.Empty;
        public string TxId { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime Vencimento { get; set; }
        public string Descricao { get; set; } = string.Empty;
    }
}
