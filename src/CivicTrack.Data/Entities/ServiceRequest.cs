using System;
using System.ComponentModel.DataAnnotations;

namespace CivicTrack.Data.Entities
{
    public class ServiceRequest
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        // Default to "Pending" as per your vision
        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key: Links the request to the Resident who created it
        public string? UserId { get; set; } = string.Empty;
        
        // Navigation Property: Allows EF to "join" the User table easily
        public Microsoft.AspNetCore.Identity.IdentityUser? User { get; set; }
    }
}