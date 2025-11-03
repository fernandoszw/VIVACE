namespace VIVACE.DTOs
{
public class EvolucaoFinanceiraDto
{
    public string Mes { get; set; } = default!;
    public decimal Receita { get; set; }
    public decimal Despesa { get; set; }
}
}