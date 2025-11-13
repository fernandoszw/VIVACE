using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Vivace.Migrations
{
    /// <inheritdoc />
    public partial class AddVencimentoToPagamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PixCopiaCola",
                table: "Pagamentos");

            migrationBuilder.DropColumn(
                name: "QrCodeBase64",
                table: "Pagamentos");

            migrationBuilder.RenameColumn(
                name: "DataPagamento",
                table: "Pagamentos",
                newName: "Vencimento");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Vencimento",
                table: "Pagamentos",
                newName: "DataPagamento");

            migrationBuilder.AddColumn<string>(
                name: "PixCopiaCola",
                table: "Pagamentos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "QrCodeBase64",
                table: "Pagamentos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
