using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.DTOs
{
    public class DashboardCreateDto
    {
        public string Mes { get; set; } = string.Empty;
        public int Ano { get; set; }
        public decimal Receita { get; set; }
        public decimal Despesa { get; set; }
        public decimal Taxa { get; set; }
    }
}
