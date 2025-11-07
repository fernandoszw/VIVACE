using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{
    public class PixKey
    {
        public int Id { get; set; }
        public string Tipo { get; set; } = string.Empty;
        public string Valor { get; set; } = string.Empty;
        public string? Nome { get; set; }
        public string? Cidade { get; set; }
        public DateTime CriadoEm { get; set; } = DateTime.Now;
    }
}
