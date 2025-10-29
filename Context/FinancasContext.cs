using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Vivace.Models;

namespace Vivace.Context
{
    public class FinancasContext:DbContext
    {
        public FinancasContext(DbContextOptions<FinancasContext> options) : base(options) { }
        
        public DbSet<Receita> Receitas { get; set; }
        public DbSet<Despesa> Despesas { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
        public DbSet<Unidade> Unidades { get; set; }
        public DbSet<Morador> Moradores { get; set; }
    }
}