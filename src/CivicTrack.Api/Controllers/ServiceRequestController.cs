using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CivicTrack.Data.Contexts;
using CivicTrack.Data.Entities;
using CivicTrack.Api.DTOs;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ServiceRequestController : ControllerBase
{
    private readonly AppDbContext _context;

    public ServiceRequestController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] ServiceRequestCreateDto dto)
    {
        var userId = User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && Guid.TryParse(c.Value, out _))?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Could not find a valid User ID in your token.");
        }

        var newRequest = new ServiceRequest
        {
            Title = dto.Title,
            Description = dto.Description,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow,
            UserId = userId
        };

        _context.ServiceRequests.Add(newRequest);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "VICTORY! Request submitted successfully!", Id = newRequest.Id });
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRequests()
    {
        var userId = User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && Guid.TryParse(c.Value, out _))?.Value;

        var requests = await _context.ServiceRequests
                                     .Where(r => r.UserId == userId)
                                     .ToListAsync();
        return Ok(requests);
    }

   [HttpGet("all")]
    [Authorize(Roles = "Worker,Admin")]
    public async Task<IActionResult> GetAllRequests()
    {
        var requests = await _context.ServiceRequests
            .Include(r => r.User)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ServiceRequestResponseDto 
            {
                Id = r.Id,
                Title = r.Title,
                Status = r.Status,
                CreatedAt = r.CreatedAt,
                // We are explicitly telling it these properties exist on 'r'
                AssignedWorkerId = r.AssignedWorkerId,
                RequestedByWorkerId = r.RequestedByWorkerId,
                ReporterEmail = r.User != null ? r.User.Email : "Unknown"
            })
            .ToListAsync();

        return Ok(requests);
    }

    // --- WORKER: REQUEST TO WORK A TASK ---
    [HttpPatch("{id}/claim")]
    [Authorize(Roles = "Worker")]
    public async Task<IActionResult> ClaimRequest(int id)
    {
        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        var workerId = User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && Guid.TryParse(c.Value, out _))?.Value;

        request.RequestedByWorkerId = workerId;
        request.Status = "Pending Assignment";
        
        await _context.SaveChangesAsync();
        return Ok(new { Message = "Request to work submitted to Admin!" });
    }

 [HttpPatch("{id}/request-to-work")]
public async Task<IActionResult> RequestToWork(int id, [FromBody] WorkerEmailDto dto)
{
    var request = await _context.ServiceRequests.FindAsync(id);
    if (request == null) return NotFound();

    request.RequestedByWorkerId = dto.WorkerEmail;
    await _context.SaveChangesAsync();
    return Ok();
}

    // --- ADMIN: ASSIGN A WORKER TO A TASK ---
[HttpPatch("{id}/assign")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> AssignWorker(int id, [FromBody] AssignWorkerDto dto)
{
    var request = await _context.ServiceRequests.FindAsync(id);
    if (request == null) return NotFound();

    request.AssignedWorkerId = dto.WorkerEmail;
    request.Status = "Assigned"; 
    request.RequestedByWorkerId = null; 
    
    await _context.SaveChangesAsync();
    return Ok(request);
}
    
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
        var validStatuses = new[] { "Pending", "In Progress", "Resolved", "Cancelled" };
        if (!validStatuses.Contains(newStatus)) return BadRequest("Invalid status.");

        var request = await _context.ServiceRequests.FindAsync(id);
        if (request == null) return NotFound();

        var currentUserId = User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && Guid.TryParse(c.Value, out _))?.Value;

        bool isWorkerOrAdmin = User.IsInRole("Worker") || User.IsInRole("Admin");
        bool isOwner = request.UserId == currentUserId;

        if (!isWorkerOrAdmin && (!isOwner || newStatus != "Cancelled"))
        {
            return Forbid();
        }

        request.Status = newStatus;
        await _context.SaveChangesAsync();

        return Ok(new { Message = $"Status updated to {newStatus}!" });
    }

   public class WorkerEmailDto 
{
    public string? WorkerEmail { get; set; }
}

public class AssignWorkerDto 
{
    public string? WorkerEmail { get; set; }
}

}