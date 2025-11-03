using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.DTOs;
using Vivace.Models;

namespace Vivace.Service
{
    public class DashboardService : IDashboardService
    {
        private readonly FinancasContext _context;

        public DashboardService(FinancasContext context)
        {
            _context = context;
        }

        public async Task<List<DashBoardResumoDto>> ObterTodosMesesAsync()
        {
            var receitas = await _context.Receitas.OrderBy(r => r.Ano).ThenBy(r => r.Mes).ToListAsync();
            var resumo = new List<DashBoardResumoDto>();

            foreach (var r in receitas)
            {
                var mesNumero = DateTime.ParseExact(r.Mes, "MMMM", null).Month;

                var despesas = await _context.Despesas
                    .Where(d => d.Ano == r.Ano && d.MesNumero == mesNumero)
                    .Select(d => new DespesaDto { Nome = d.Nome, Valor = d.Valor, Mes = r.Mes, Ano = r.Ano })
                    .ToListAsync();

                resumo.Add(new DashBoardResumoDto
                {
                    Mes = r.Mes,
                    Ano = r.Ano,
                    Receita = r.Valor,
                    Despesa = despesas.Sum(d => d.Valor),
                    Despesas = despesas,
                    Taxa = 0
                });
            }

            return resumo;
        }

        public async Task<DashBoardResumoDto> AdicionarMesAsync(DashBoardResumoDto mes)
        {
            var mesNumero = DateTime.ParseExact(mes.Mes, "MMMM", null).Month;

            var receita = new Receita
            {
                Mes = mes.Mes,
                Ano = mes.Ano,
                Valor = mes.Receita
            };
            _context.Receitas.Add(receita);

            if (mes.Despesas != null)
            {
                foreach (var d in mes.Despesas)
                {
                    _context.Despesas.Add(new Despesa
                    {
                        Nome = d.Nome,
                        MesNumero = mesNumero,
                        Ano = mes.Ano,
                        Valor = d.Valor
                    });
                }
            }

            await _context.SaveChangesAsync();
            return mes;
        }

        public async Task RemoverMesAsync(string mes, int ano)
        {
            var mesNumero = DateTime.ParseExact(mes, "MMMM", null).Month;

            var receitas = await _context.Receitas
                .Where(r => r.Ano == ano && DateTime.ParseExact(r.Mes, "MMMM", null).Month == mesNumero)
                .ToListAsync();
            _context.Receitas.RemoveRange(receitas);

            var despesas = await _context.Despesas
                .Where(d => d.Ano == ano && d.MesNumero == mesNumero)
                .ToListAsync();
            _context.Despesas.RemoveRange(despesas);

            await _context.SaveChangesAsync();
        }

        public async Task<List<DespesaDto>> ObterDespesasPorMesAsync(string mes, int ano)
        {
            var mesNumero = DateTime.ParseExact(mes, "MMMM", null).Month;

            var despesas = await _context.Despesas
                .Where(d => d.Ano == ano && d.MesNumero == mesNumero)
                .Select(d => new DespesaDto
                {
                    Nome = d.Nome,
                    Valor = d.Valor,
                    Mes = mes,
                    Ano = ano
                })
                .ToListAsync();

            return despesas;
        }

        public async Task AdicionarDespesaAsync(string mes, int ano, DespesaDto despesa)
        {
            var mesNumero = DateTime.ParseExact(mes, "MMMM", null).Month;

            var novaDespesa = new Despesa
            {
                Nome = despesa.Nome,
                Valor = despesa.Valor,
                MesNumero = mesNumero,
                Ano = ano
            };

            _context.Despesas.Add(novaDespesa);
            await _context.SaveChangesAsync();
        }
    }
}
