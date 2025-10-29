using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{
    public class Unidade
    {
        public int Id { get; set; }
        public string Numero { get; set; }
        public int MoradorId { get; set; }
        public Morador Morador { get; set; }
    }
}