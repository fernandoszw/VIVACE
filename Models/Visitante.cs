namespace VIVACE.Models
{
    public class Visitante
    {
namespace VIVACE.Models
    {
        public class Visitante
        {
            [Key]
            public int Id { get; set; }

            [Required]
            public string Nome { get; set; } = string.Empty;

            [Required]
            public string Documento { get; set; } = string.Empty;

            [Required]
            public string Telefone { get; set; } = string.Empty;

            public string? Veiculo { get; set; }

            public string? Observacoes { get; set; }

            [Required]
            public DateTime DataVisita { get; set; }

            public DateTime? DataEntrada { get; set; }

            public DateTime? DataSaida { get; set; }

            public DateTime DataCadastro { get; set; } = DateTime.Now;

            [Required]
            public string Status { get; set; } = "Agendado";
            // Agendado, Dentro, Saiu, Cancelado, NãoCompareceu

            [Required]
            public string MoradorId { get; set; } = string.Empty; // FK (ex: id do usuário logado)

            public string? Unidade { get; set; }
        }
    }
}
}