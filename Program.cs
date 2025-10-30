using Microsoft.EntityFrameworkCore;
using Vivace.Context;
using Vivace.Service;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<FinancasContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("ConexaoPadrao")));

builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IRelatorioService, RelatorioService>();

builder.Services.AddControllers();

// 🔥 Habilita o CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()    // permite qualquer origem (pode trocar por endereço do front depois)
              .AllowAnyMethod()
              .AllowAnyHeader());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

// ✅ Usa o CORS aqui
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
