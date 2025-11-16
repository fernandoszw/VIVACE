using VIVACE.Models;

public class Fatura
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty; // ⚡ inicializa para evitar CS8618
    public decimal Valor { get; set; }
    public string Unidade { get; set; } = string.Empty; // ⚡ inicializa
    public DateTime Vencimento { get; set; }
    public bool Paga { get; set; } = false;

    // 🔹 Relacionamento com Dashboard
    public int DashboardId { get; set; }
    public Dashboard? Dashboard { get; set; }
}

