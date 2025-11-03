using System.Collections.Generic;
using System.Threading.Tasks;
using Vivace.Models;
using VIVACE.Models;

namespace Vivace.Interfaces
{
    public interface IDashboardService
    {
        Task<List<Dashboard>> ObterTodosMesesAsync();
        Task<Dashboard> AdicionarMesAsync(Dashboard dashboard);
        Task<Despesa> AdicionarDespesaAsync(int dashboardId, Despesa despesa);
        Task<bool> RemoverMesAsync(int dashboardId);
    }
}
