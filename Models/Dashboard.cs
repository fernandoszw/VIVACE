using System;
using System.Collections.Generic;
using Vivace.Models;

namespace VIVACE.Models
{
    public class Dashboard
    {
        public int Id { get; set; }
        public string Mes { get; set; } = string.Empty;
        public int Ano { get; set; }
        public decimal Receita { get; set; }
        public decimal Despesa { get; set; } // soma das despesas
        public decimal Taxa { get; set; }

        // Número do mês para ordenação no banco
        public int MesNumero { get; set; }

        // Relacionamento com despesas
        public List<Despesa> Despesas { get; set; } = new();
    }
}
