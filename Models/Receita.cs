using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{
    public class Receita
    {
        public int Id { get; set; }
        public string Descricao { get; set; }
        public decimal Valor { get; set; }
        public DateTime Data { get; set; }
    }
}