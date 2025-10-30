using System.Collections.Generic;

namespace Vivace.Models
{
    public class Morador
    {
        public int Id { get; set; }
        public string Nome { get; set; }

        public ICollection<Unidade> Unidades { get; set; }
    }
}
