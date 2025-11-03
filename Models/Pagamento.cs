using System;

namespace Vivace.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public decimal Valor { get; set; }
        public bool Pago { get; set; }
        public DateTime DataVencimento { get; set; }

        // Propriedades derivadas para facilitar filtros
        public int Mes => DataVencimento.Month;
        public int Ano => DataVencimento.Year;

        public int UnidadeId { get; set; }
        public Unidade Unidade { get; set; } = default!;
    }
}
