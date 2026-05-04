using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

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

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key: Links the request to the Resident/Citizen
        public string? UserId { get; set; }
        
        // Navigation Property for the Resident
        public IdentityUser? User { get; set; }

        // --- NEW WORKER TRACKING FIELDS ---
        
        // The ID of the worker currently assigned to the task
       public string? AssignedWorkerId {get; set;}

        // The ID of a worker who has "requested" to work on this
        public string? RequestedByWorkerId { get; set; }

        public string? ReporterEmail { get; set; }
    }
}