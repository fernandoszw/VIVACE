using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.DTOs
{
    public class InadimplenciaDto
    {
        public string Unidade { get; set; }
        public string Morador { get; set; }
        public decimal Valor { get; set; }
        public int DiasAtraso { get; set; }
    }
}