namespace VIVACE
{
    public interface IFaturaService
{
    Task<Fatura> CriarFaturaAsync(FaturaCreateDto dto);
}

}