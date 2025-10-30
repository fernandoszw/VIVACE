using System.Collections.Generic;
using System.Threading.Tasks;
using Vivace.DTOs;

namespace Vivace.Service
{
    public interface IDashboardService
    {
        Task<DashBoardResumoDto> ObterResumoAsync();
        Task<List<EvolucaoFinanceiraDto>> ObterEvolucaoFinanceiraAsync();
    }
}
