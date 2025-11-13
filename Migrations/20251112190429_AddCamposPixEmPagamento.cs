using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vivace.Migrations
{
    /// <inheritdoc />
    public partial class AddCamposPixEmPagamento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "Pagamentos",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "Vencimento",
                table: "Pagamentos",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "Vencimento",
                table: "Pagamentos");
        }
    }
}
