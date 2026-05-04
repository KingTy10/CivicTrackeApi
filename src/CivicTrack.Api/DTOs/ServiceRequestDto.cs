namespace CivicTrack.Api.DTOs
{
    public class ServiceRequestCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty; // e.g., Pothole, Graffiti
    }

    public class ServiceRequestResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        public string? AssignedWorkerId { get; set; }
        public string? RequestedByWorkerId { get; set; }
        public string? ReporterEmail { get; set; }
    }
}