using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Vivace.Context;
using Vivace.DTOs;

namespace Vivace.Service
{
    public class RelatorioService : IRelatorioService
    {
        private readonly FinancasContext _context;

        public RelatorioService(FinancasContext context)
        {
            _context = context;
        }

        public async Task<List<InadimplenciaDto>> ObterInadimplenciaAsync()
        {
            var hoje = DateTime.Now;

            return await _context.Pagamentos
                .Include(p => p.Unidade)
                .ThenInclude(u => u.Morador)
                .Where(p => !p.Pago && p.DataVencimento < hoje)
                .Select(p => new InadimplenciaDto
                {
                    Unidade = p.Unidade.Numero,
                    Morador = p.Unidade.Morador.Nome,
                    Valor = p.Valor,
                    DiasAtraso = (int)(hoje - p.DataVencimento).TotalDays
                })
                .ToListAsync();
        }

        public async Task<byte[]> GerarBalancetePdfAsync(int mes, int ano)
        {
            var receitas = await _context.Receitas
                .Where(r => r.Data.Month == mes && r.Data.Year == ano)
                .ToListAsync();

            var despesas = await _context.Despesas
                .Where(d => d.Data.Month == mes && d.Data.Year == ano)
                .ToListAsync();

            using var ms = new MemoryStream();
            var doc = new Document(PageSize.A4);
            PdfWriter.GetInstance(doc, ms);
            doc.Open();

            doc.Add(new Paragraph($"Balancete - {mes}/{ano}"));
            doc.Add(new Paragraph(" "));
            doc.Add(new Paragraph("Receitas:"));
            foreach (var r in receitas)
                doc.Add(new Paragraph($"{r.Descricao}: R$ {r.Valor:F2}"));

            doc.Add(new Paragraph(" "));
            doc.Add(new Paragraph("Despesas:"));
            foreach (var d in despesas)
                doc.Add(new Paragraph($"{d.Descricao}: R$ {d.Valor:F2}"));

            doc.Add(new Paragraph(" "));
            doc.Add(new Paragraph($"Saldo: R$ {(receitas.Sum(r => r.Valor) - despesas.Sum(d => d.Valor)):F2}"));
            doc.Close();

            return ms.ToArray();
        }

        public async Task<byte[]> GerarInadimplenciaExcelAsync()
        {
            var dados = await ObterInadimplenciaAsync();

            using var package = new ExcelPackage();
            var ws = package.Workbook.Worksheets.Add("Inadimplência");

            ws.Cells[1, 1].Value = "Unidade";
            ws.Cells[1, 2].Value = "Morador";
            ws.Cells[1, 3].Value = "Valor";
            ws.Cells[1, 4].Value = "Dias Atraso";

            for (int i = 0; i < dados.Count; i++)
            {
                ws.Cells[i + 2, 1].Value = dados[i].Unidade;
                ws.Cells[i + 2, 2].Value = dados[i].Morador;
                ws.Cells[i + 2, 3].Value = dados[i].Valor;
                ws.Cells[i + 2, 4].Value = dados[i].DiasAtraso;
            }

            ws.Cells.AutoFitColumns();

            return await package.GetAsByteArrayAsync();
        }
    }
}
