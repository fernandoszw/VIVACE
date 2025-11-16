using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.DTOs;
using Vivace.Interfaces;
using VIVACE.Models;
using System;
using System.Threading.Tasks;

namespace VIVACE.Service
{
    public class PagamentoService : IPagamentoService
    {
        private readonly FinancasContext _ctx;

        public PagamentoService(FinancasContext ctx)
        {
            _ctx = ctx;
        }

        public async Task<Fatura> AdicionarFaturaMesAtualAsync(FaturaCreateDto dto)
        {
            var mesAtual = DateTime.Now.Month;
            var anoAtual = DateTime.Now.Year;

            var dashboard = await _ctx.Dashboards
                .Include(d => d.Faturas)
                .FirstOrDefaultAsync(d => d.MesNumero == mesAtual && d.Ano == anoAtual);

            if (dashboard == null)
                throw new InvalidOperationException("Dashboard do mês atual não encontrado.");

            var fatura = new Fatura
            {
                Nome = dto.Nome,
                Valor = dto.Valor,
                Unidade = dto.Unidade,
                Vencimento = dto.Vencimento,
                DashboardId = dashboard.Id
            };

            _ctx.Faturas.Add(fatura);
            await _ctx.SaveChangesAsync();

            return fatura;
        }
    }
}
