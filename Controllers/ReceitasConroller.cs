using Microsoft.AspNetCore.Mvc;
using Vivace.Context;
using Vivace.Models;

namespace Vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReceitasController : ControllerBase
    {
        private readonly FinancasContext _context;

        public ReceitasController(FinancasContext context)
        {
            _context = context;
        }

        // GET: api/receitas
        [HttpGet]
        public IActionResult GetAll()
        {
            var receitas = _context.Receitas.ToList();
            return Ok(receitas);
        }

        // GET: api/receitas/5
        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var receita = _context.Receitas.Find(id);
            if (receita == null)
                return NotFound();

            return Ok(receita);
        }

        // POST: api/receitas
        [HttpPost]
        public IActionResult Create([FromBody] Receita receita)
        {
            if (receita == null)
                return BadRequest();

            _context.Receitas.Add(receita);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetById), new { id = receita.Id }, receita);
        }

        // PUT: api/receitas/5
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] Receita receita)
        {
            var receitaExistente = _context.Receitas.Find(id);
            if (receitaExistente == null)
                return NotFound();

            receitaExistente.Descricao = receita.Descricao;
            receitaExistente.Valor = receita.Valor;
            receitaExistente.Data = receita.Data;

            _context.SaveChanges();

            return Ok(receitaExistente);
        }

        // DELETE: api/receitas/5
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var receita = _context.Receitas.Find(id);
            if (receita == null)
                return NotFound();

            _context.Receitas.Remove(receita);
            _context.SaveChanges();

            return NoContent();
        }
    }
}
