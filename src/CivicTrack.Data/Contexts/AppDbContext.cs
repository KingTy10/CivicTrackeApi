using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using CivicTrack.Data.Entities; // This tells it where ServiceRequest lives

namespace CivicTrack.Data.Contexts
{
    public class AppDbContext : IdentityDbContext<IdentityUser>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // We use the full path here just to be 100% safe
        public DbSet<CivicTrack.Data.Entities.ServiceRequest> ServiceRequests { get; set; }
    }
}