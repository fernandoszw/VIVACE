public class FaturaCreateDto
{
    public string Nome { get; set; }
    public decimal Valor { get; set; }
    public string Unidade { get; set; } // Ex: "Apt 101"
    public DateTime Vencimento { get; set; }
}
