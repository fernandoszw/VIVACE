using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Vivace.DTOs;

namespace Vivace.Interfaces
{
    public interface IDashboardService
    {
        Task<DashBoardResumoDto> ObterResumoAsync();
        Task<List<EvolucaoFinanceiraDto>> ObterEvolucaoFinanceiraAsync();
        Task<List<DespesaCategoriaDto>> ObterDespesasPorCategoriaAsync();
    }
}