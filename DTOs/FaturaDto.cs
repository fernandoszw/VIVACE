using System;

namespace Vivace.DTOs
{
    public class FaturaDto
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public string Unidade { get; set; } = string.Empty;
        public DateTime Vencimento { get; set; }
        public bool Paga { get; set; }
    }
}
