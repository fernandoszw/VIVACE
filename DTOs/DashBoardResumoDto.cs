using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.DTOs
{
    public class DashBoardResumoDto
    {
        public decimal ReceitaMensal { get; set; }
        public decimal DespesaMensal { get; set; }
        public decimal TaxaCobranca { get; set; }
        public int UnidadesInadimplentes { get; set; }
    }
}