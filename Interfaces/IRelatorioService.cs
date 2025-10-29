using Vivace.DTOs;


namespace Vivace.Interfaces
{
    public interface IRelatorioService
    {
        Task<byte[]> GerarBalancetePdfAsync(int mes, int ano);
        Task<byte[]> GerarInadimplenciaExcelAsync();
        Task<List<InadimplenciaDto>> ObterInadimplenciaAsync();
    }
}