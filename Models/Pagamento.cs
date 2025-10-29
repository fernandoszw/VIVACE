using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Vivace.Models
{
    public class Pagamento
    {
        public int Id { get; set; }
        public int UnidadeId { get; set; }
        public Unidade Unidade { get; set; }
        public decimal Valor { get; set; }
        public DateTime DataVencimento { get; set; }
        public bool Pago { get; set; }
    }
}