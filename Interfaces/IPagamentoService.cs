using System.Threading.Tasks;
using VIVACE.Models;
using Vivace.DTOs;

namespace Vivace.Interfaces
{
    public interface IPagamentoService
    {
        Task<Fatura> AdicionarFaturaMesAtualAsync(FaturaCreateDto dto);
    }
}
