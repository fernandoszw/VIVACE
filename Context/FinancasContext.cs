using Microsoft.EntityFrameworkCore;
using Vivace.Models;
using VIVACE.Models;

namespace Vivace.Context
{
    public class FinancasContext : DbContext
    {
        public FinancasContext(DbContextOptions<FinancasContext> options) : base(options) { }

        public DbSet<Dashboard> Dashboards { get; set; }
        public DbSet<Despesa> Despesas { get; set; }
        public DbSet<Pagamento> Pagamentos { get; set; }
        public DbSet<PixKey> PixKeys { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔗 Relacionamento entre Dashboard e Despesa
            modelBuilder.Entity<Despesa>()
                .HasOne(d => d.Dashboard)
                .WithMany(dash => dash.Despesas)
                .HasForeignKey(d => d.DashboardId)
                .OnDelete(DeleteBehavior.Cascade);

            // 💰 Corrige o warning de truncamento decimal
            modelBuilder.Entity<Pagamento>()
                .Property(p => p.Valor)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Despesa>()
                .Property(d => d.Valor)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Dashboard>()
                .Property(d => d.Receita)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Dashboard>()
                .Property(d => d.Despesa)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Dashboard>()
                .Property(d => d.Taxa)
                .HasPrecision(18, 2);
        }
    }
}
