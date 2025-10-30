using Microsoft.EntityFrameworkCore;
using Vivace.Models;



namespace Vivace.Context
{
    public class FinancasContext : DbContext
    {
        public FinancasContext(DbContextOptions<FinancasContext> options) : base(options) { }


        public DbSet<Receita> Receitas { get; set; }
        public DbSet<Despesa> Despesas { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
        public DbSet<Unidade> Unidades { get; set; }
        public DbSet<Morador> Moradores { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);


            modelBuilder.Entity<Unidade>()
            .HasOne(u => u.Morador)
            .WithMany(m => m.Unidades)
            .HasForeignKey(u => u.MoradorId);


            modelBuilder.Entity<Pagamento>()
            .HasOne(p => p.Unidade)
            .WithMany(u => u.Pagamentos)
            .HasForeignKey(p => p.UnidadeId);
        }
    }
}