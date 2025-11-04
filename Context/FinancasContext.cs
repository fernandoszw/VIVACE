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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 🔹 Configuração do relacionamento
            modelBuilder.Entity<Despesa>()
                .HasOne(d => d.Dashboard)
                .WithMany(dash => dash.Despesas)
                .HasForeignKey(d => d.DashboardId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
