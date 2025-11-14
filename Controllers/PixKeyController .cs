using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Vivace.Context;
using VIVACE.Models;

namespace VIVACE.Controllers
{
[ApiController]
[Route("api/[controller]")]
public class PixKeyController : ControllerBase
{
    private readonly FinancasContext _context;
    public PixKeyController(FinancasContext context) => _context = context;

    // GET: api/PixKey
    [HttpGet]
    public IActionResult ObterChaves()
    {
        var chaves = _context.PixKeys
            .Select(p => new { p.Id, p.Chave })
            .ToList();
        return Ok(chaves);
    }

    // POST: api/PixKey
    [HttpPost]
    public IActionResult AdicionarChave([FromBody] string chave)
    {
        if (string.IsNullOrWhiteSpace(chave))
            return BadRequest("Chave inválida.");

        var pix = new PixKey { Chave = chave };
        _context.PixKeys.Add(pix);
        _context.SaveChanges();
        return Ok(pix);
    }
}

}