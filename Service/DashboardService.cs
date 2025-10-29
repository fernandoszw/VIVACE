using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vivace.DTOs;

namespace Vivace.Service
{
public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardResumoDto> ObterResumoAsync()
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

        return new DashboardResumoDto
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
        var dados = await _context.Receitas
            .Where(r => r.Data >= ultimos6Meses)
            .GroupBy(r => new { r.Data.Year, r.Data.Month })
            .Select(g => new EvolucaoFinanceiraDto
            {
                Mes = $"{g.Key.Month}/{g.Key.Year}",
                Receita = g.Sum(r => r.Valor),
                Despesa = _context.Despesas
                    .Where(d => d.Data.Month == g.Key.Month && d.Data.Year == g.Key.Year)
                    .Sum(d => d.Valor)
            })
            .ToListAsync();

        return dados;
    }
}

}