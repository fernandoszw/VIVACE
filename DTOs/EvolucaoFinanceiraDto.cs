using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.DTOs
{
    public class EvolucaoFinanceiraDto
    {
        public string Mes { get; set; }
        public decimal Receita { get; set; }
        public decimal Despesa { get; set; }
    }
}