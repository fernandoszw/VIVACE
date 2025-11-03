using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{

    public class Despesa
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public int MesNumero { get; set; }
        public int Ano { get; set; }
        public decimal Valor { get; set; }
    }
}