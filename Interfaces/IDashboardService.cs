using Vivace.DTOs;

namespace Vivace.Service
{
    public interface IDashboardService
    {
        Task<List<DashBoardResumoDto>> ObterTodosMesesAsync();
        Task<DashBoardResumoDto> AdicionarMesAsync(DashBoardResumoDto mes);
        Task RemoverMesAsync(string mes, int ano);
        Task<List<DespesaDto>> ObterDespesasPorMesAsync(string mes, int ano);
        Task AdicionarDespesaAsync(string mes, int ano, DespesaDto despesa); // <-- aqui
    }
}
