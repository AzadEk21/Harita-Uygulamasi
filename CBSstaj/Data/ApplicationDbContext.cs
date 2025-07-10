using CBSstaj.Models;
using Microsoft.EntityFrameworkCore;
using CBSstaj.Interfaces;
using CBSstaj.Repositories;

namespace CBSstaj.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            UnitOfWork = new UnitOfWork(this);
        }

        public DbSet<Point> Points { get; set; }
        public DbSet<User> Users { get; set; }

        public IUnitOfWork UnitOfWork { get; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Point>()
                .Property(p => p.Id)
                .UseIdentityAlwaysColumn();

            modelBuilder.Entity<Point>()
                .Property(p => p.Geometry)
                .HasColumnType("text"); 
        }
    }
}
