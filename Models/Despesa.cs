using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using VIVACE.Models;

namespace Vivace.Models
{

public class Despesa
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public int MesNumero { get; set; }
    public int Ano { get; set; }

    // Relacionamento opcional para EF
    public int DashboardId { get; set; }
    public Dashboard Dashboard { get; set; } = null!;
}

}