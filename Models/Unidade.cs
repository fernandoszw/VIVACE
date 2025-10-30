using System.Collections.Generic;

namespace Vivace.Models
{
    public class Unidade
    {
        public int Id { get; set; }
        public string Numero { get; set; }
        public int MoradorId { get; set; }
        public Morador Morador { get; set; }

        public ICollection<Pagamento> Pagamentos { get; set; }
    }
}
