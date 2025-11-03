namespace Vivace.DTOs
{
    public class DespesaDto
    {
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string Mes { get; set; } = string.Empty;
        public int Ano { get; set; }
    }
}
