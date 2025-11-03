using System.Collections.Generic;

namespace Vivace.DTOs
{
    public class DashBoardResumoDto
    {
        public string Mes { get; set; } = string.Empty;
        public int Ano { get; set; }
        public decimal Receita { get; set; }
        public decimal Despesa { get; set; }
        public decimal Taxa { get; set; }
        public List<DespesaDto> Despesas { get; set; } = new();
    }
}
