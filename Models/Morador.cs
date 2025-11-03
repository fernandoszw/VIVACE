using System.Collections.Generic;

namespace Vivace.Models
{
    public class Morador
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public List<Unidade> Unidades { get; set; } = new();
    }
}
