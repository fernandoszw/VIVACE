using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace VIVACE.DTOs
{
    public class DespesaCreateDto
    {
        public string Nome { get; set; } = string.Empty;
        public decimal Valor { get; set; }
    }
}