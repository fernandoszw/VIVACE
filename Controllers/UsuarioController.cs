using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Hybrid;
using vivace.Context;
using vivace.Model;

namespace vivace.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuarioController : ControllerBase
    {
        private readonly UsuarioContext _context;

        public UsuarioController(UsuarioContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult Create(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetByName), new { id = usuario.Id }, usuario);
        }

        [HttpGet("GetByName")]
        public IActionResult GetByName(string nome)
        {
            var usuario = _context.Usuarios.Where(x => x.Nome.Contains(nome));
            _context.SaveChanges();

            return Ok(usuario);
        }

        [HttpPut]
        public IActionResult Update(Usuario usuario, int id)
        {
            var usuarioBanco = _context.Usuarios.Find(id);


            usuarioBanco.Nome = usuario.Nome;
            usuarioBanco.Email = usuario.Email;
            usuarioBanco.Senha = usuario.Senha;

            _context.Usuarios.Update(usuarioBanco);
            _context.SaveChanges();

            return Ok(usuarioBanco);
        }

        [HttpDelete]
        public IActionResult Delete(int id)
        {
            var usuarioBanco = _context.Usuarios.Find(id);

            _context.Usuarios.Remove(usuarioBanco);
            _context.SaveChanges();

            return NoContent();
        }

    }
}