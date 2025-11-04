using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.Models;
using VIVACE.Models;
using Vivace.Interfaces;

namespace Vivace.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly FinancasContext _context;

        public DashboardService(FinancasContext context)
        {
            _context = context;
        }

        // ✅ Adicionar novo mês
        public async Task<Dashboard> AdicionarMesAsync(Dashboard dashboard)
        {
            _context.Dashboards.Add(dashboard);
            await _context.SaveChangesAsync();
            return dashboard;
        }

        // ✅ Obter todos os meses
        public async Task<List<Dashboard>> ObterTodosMesesAsync()
        {
            return await _context.Dashboards
                .Include(d => d.Despesas)
                .OrderBy(d => d.Ano)
                .ThenBy(d => d.MesNumero)
                .ToListAsync();
        }

        // ✅ Adicionar despesa distribuída
        public async Task<Despesa> AdicionarDespesaAsync(int dashboardId, Despesa despesa)
        {
            var dashboard = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == dashboardId);

            if (dashboard == null)
                throw new InvalidOperationException("Mês não encontrado.");

            var totalDistribuido = dashboard.Despesas.Sum(d => d.Valor);
            if (totalDistribuido + despesa.Valor > dashboard.Despesa)
                throw new InvalidOperationException("Total das despesas distribuídas excede o limite planejado.");

            despesa.DashboardId = dashboardId;

            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();

            return despesa;
        }

        // ✅ Remover mês
        public async Task<bool> RemoverMesAsync(int id)
        {
            var dashboard = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == id);

            if (dashboard == null)
                return false;

            _context.Despesas.RemoveRange(dashboard.Despesas);
            _context.Dashboards.Remove(dashboard);

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
