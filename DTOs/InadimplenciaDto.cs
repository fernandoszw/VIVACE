namespace VIVACE.DTOs
{
    public class InadimplenciaDto
    {
        public string Unidade { get; set; } = default!;
        public string Morador { get; set; } = default!;
        public decimal Valor { get; set; }
        public int DiasAtraso { get; set; }
    }

}