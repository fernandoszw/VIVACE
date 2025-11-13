using Vivace.DTOs;
using Vivace.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Vivace.Interfaces
{
    public interface IPagamentoService
    {
        Task<PagamentoResultDto> RegistrarPagamentoAsync(Pagamento pagamento);
        Task<IEnumerable<Pagamento>> ListarPagamentosAsync();
        Task<bool> ConfirmarPagamentoAsync(int id);
    }
}
