using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.Interfaces;
using Vivace.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VIVACE.Models;

namespace Vivace.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly FinancasContext _context;

        public DashboardService(FinancasContext context)
        {
            _context = context;
        }

        public async Task<List<Dashboard>> ObterTodosMesesAsync()
        {
            // Usa AsNoTracking para evitar problemas de rastreamento
            var dashboards = await _context.Dashboards
                .Include(d => d.Despesas)
                .AsNoTracking()
                .ToListAsync();

            // Ordena por ano e número do mês
            var mesesOrdenados = dashboards
                .OrderBy(d => d.Ano)
                .ThenBy(d => DateTime.ParseExact(d.Mes, "MMMM", null).Month)
                .ToList();

            return mesesOrdenados;
        }

        public async Task<Dashboard> AdicionarMesAsync(Dashboard dashboard)
        {
            _context.Dashboards.Add(dashboard);
            await _context.SaveChangesAsync();
            return dashboard;
        }

        public async Task<Despesa> AdicionarDespesaAsync(int dashboardId, Despesa despesa)
        {
            var dash = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == dashboardId);

            if (dash == null) throw new KeyNotFoundException("Dashboard não encontrado");

            // Limite da despesa total
            decimal somaAtual = dash.Despesas.Sum(d => d.Valor);
            if (somaAtual + despesa.Valor > dash.Despesa)
                throw new InvalidOperationException("A soma das despesas não pode exceder a despesa total do mês");

            despesa.DashboardId = dashboardId;
            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();
            return despesa;
        }

        public async Task<bool> RemoverMesAsync(int dashboardId)
        {
            var dash = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == dashboardId);

            if (dash == null) return false;

            _context.Despesas.RemoveRange(dash.Despesas);
            _context.Dashboards.Remove(dash);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
