using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{
    public class Receita
    {
        public int Id { get; set; }
        public string Mes { get; set; }
        public int Ano { get; set; }
        public decimal Valor { get; set; }
    }

}