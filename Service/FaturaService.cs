using Vivace.Context;

namespace VIVACE.Service
{
    public class FaturaService : IFaturaService
    {
        private readonly FinancasContext _context;

        public FaturaService(FinancasContext context)
        {
            _context = context;
        }

        public async Task<Fatura> CriarFaturaAsync(FaturaCreateDto dto)
        {
            var fatura = new Fatura
            {
                Nome = dto.Nome,
                Valor = dto.Valor,
                Unidade = dto.Unidade,
                Vencimento = dto.Vencimento
            };

            _context.Faturas.Add(fatura);
            await _context.SaveChangesAsync();
            return fatura;
        }
    }
}