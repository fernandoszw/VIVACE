using System.Collections.Generic;
using System.Threading.Tasks;
using Vivace.DTOs;

namespace Vivace.Service
{
    public interface IRelatorioService
    {
        Task<byte[]> GerarBalancetePdfAsync(int mes, int ano);
        Task<byte[]> GerarInadimplenciaExcelAsync();
        Task<List<InadimplenciaDto>> ObterInadimplenciaAsync();
    }
}
