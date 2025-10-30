using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vivace.Context;
using Vivace.DTOs;

namespace Vivace.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly FinancasContext _context;

        public DashboardService(FinancasContext context)
        {
            _context = context;
        }

        public async Task<DashBoardResumoDto> ObterResumoAsync()
        {
            var hoje = DateTime.Now;
            var mesAtual = hoje.Month;
            var anoAtual = hoje.Year;

            var receitaMensal = await _context.Receitas
                .Where(r => r.Data.Month == mesAtual && r.Data.Year == anoAtual)
                .SumAsync(r => (decimal?)r.Valor) ?? 0;

            var despesaMensal = await _context.Despesas
                .Where(d => d.Data.Month == mesAtual && d.Data.Year == anoAtual)
                .SumAsync(d => (decimal?)d.Valor) ?? 0;

            var totalUnidades = await _context.Unidades.CountAsync();
            var inadimplentes = await _context.Pagamentos
                .CountAsync(p => !p.Pago && p.DataVencimento < hoje);

            var taxaCobranca = totalUnidades == 0 ? 0 :
                (1 - ((double)inadimplentes / totalUnidades)) * 100;

            return new DashBoardResumoDto
            {
                ReceitaMensal = receitaMensal,
                DespesaMensal = despesaMensal,
                TaxaCobranca = (decimal)Math.Round(taxaCobranca, 2),
                UnidadesInadimplentes = inadimplentes
            };
        }

        public async Task<List<EvolucaoFinanceiraDto>> ObterEvolucaoFinanceiraAsync()
        {
            var ultimos6Meses = DateTime.Now.AddMonths(-5);

            var receitas = await _context.Receitas
                .Where(r => r.Data >= ultimos6Meses)
                .GroupBy(r => new { r.Data.Year, r.Data.Month })
                .Select(g => new
                {
                    Mes = $"{g.Key.Month}/{g.Key.Year}",
                    Receita = g.Sum(r => r.Valor)
                })
                .ToListAsync();

            var despesas = await _context.Despesas
                .Where(d => d.Data >= ultimos6Meses)
                .GroupBy(d => new { d.Data.Year, d.Data.Month })
                .Select(g => new
                {
                    Mes = $"{g.Key.Month}/{g.Key.Year}",
                    Despesa = g.Sum(d => d.Valor)
                })
                .ToListAsync();

            var resultado = (from r in receitas
                             join d in despesas on r.Mes equals d.Mes into gj
                             from desp in gj.DefaultIfEmpty()
                             select new EvolucaoFinanceiraDto
                             {
                                 Mes = r.Mes,
                                 Receita = r.Receita,
                                 Despesa = desp?.Despesa ?? 0
                             }).ToList();

            return resultado;
        }
    }
}
