using Microsoft.AspNetCore.Identity; // This is the important part!

namespace CivicTrack.Data.Entities
{
    // Adding ': IdentityUser' gives your class the UserName and Email properties
    public class User : IdentityUser
    {
        // IdentityUser already has an Id and Email, 
        // so you only need to list your CUSTOM fields here
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
    }
}
