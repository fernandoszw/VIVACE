using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.Interfaces;
using Vivace.Service;
using VIVACE;

var builder = WebApplication.CreateBuilder(args);

// Banco de dados
builder.Services.AddDbContext<FinancasContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConexaoPadrao")));

// Serviços
builder.Services.AddHttpClient();
builder.Services.AddScoped<IPagamentoService, PagamentoService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();
app.Run();
