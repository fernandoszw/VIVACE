using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vivace.Context;
using Vivace.Interfaces;
using Vivace.Models;
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

        public async Task<Dashboard> AdicionarMesAsync(Dashboard dashboard)
        {
            _context.Dashboards.Add(dashboard);
            await _context.SaveChangesAsync();
            return dashboard;
        }

        public async Task<List<Dashboard>> ObterTodosMesesAsync()
        {
            return await _context.Dashboards
                .Include(d => d.Despesas)
                .OrderBy(d => d.Ano)
                .ThenBy(d => d.MesNumero)
                .ToListAsync();
        }

        public async Task<Despesa> AdicionarDespesaAsync(int dashboardId, Despesa despesa)
        {
            var dashboard = await _context.Dashboards
                .Include(d => d.Despesas)
                .FirstOrDefaultAsync(d => d.Id == dashboardId);

            if (dashboard == null)
                throw new InvalidOperationException("Mês não encontrado.");

            var totalDistribuido = dashboard.Despesas.Sum(d => d.Valor);
            if (totalDistribuido + despesa.Valor > dashboard.Despesa)
                throw new InvalidOperationException("Excede o limite da despesa do mês.");

            despesa.DashboardId = dashboardId;
            despesa.MesNumero = dashboard.MesNumero;
            despesa.Ano = dashboard.Ano;

            _context.Despesas.Add(despesa);
            await _context.SaveChangesAsync();

            return despesa;
        }

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
