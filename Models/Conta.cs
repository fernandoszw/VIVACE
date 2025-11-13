namespace Vivace.Models
{
    public class Conta
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public DateTime Vencimento { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public bool Paga { get; set; } = false;
    }
}
