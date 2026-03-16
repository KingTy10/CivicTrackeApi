using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CivicTrack.Data.Contexts;
using CivicTrack.Data.Entities; // Ensure this matches your Entity namespace
using CivicTrack.Api.DTOs;

[Route("api/[controller]")]
[ApiController]
[Authorize] // You MUST be logged in to use any of these
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
    // Specifically find the claim that looks like a GUID (the long ID)
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
        UserId = userId // This will now be "24eb96a0..." instead of "Test@hotmail.com"
    };

    _context.ServiceRequests.Add(newRequest);
    await _context.SaveChangesAsync();

    return Ok(new { Message = "VICTORY! Request submitted successfully!", Id = newRequest.Id });
}
   /*  [HttpPost]
    public async Task<IActionResult> CreateRequest([FromBody] ServiceRequestCreateDto dto)
    {
    // List ALL claims so we can see what the token actually contains
    var claims = User.Claims.Select(c => $"{c.Type}: {c.Value}").ToList();
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

    return BadRequest(new { 
        Message = "Debugging ID", 
        DetectedUserId = userId, 
        AllClaimsInToken = claims 
    });
    }*/
    [HttpGet]
    public async Task<IActionResult> GetMyRequests()
    {
    // Find the GUID, not the Email
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
        .Select(r => new {
            r.Id,
            r.Title,
            r.Description,
            r.Status,
            r.CreatedAt,
            ReporterEmail = r.User != null ? r.User.Email : "Unknown"
        })
        .ToListAsync();

        return Ok(requests);
    }




    [HttpPatch("{id}/status")]
    [Authorize] // Anyone logged in can try, but we check permissions below
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
    {
    var validStatuses = new[] { "Pending", "In Progress", "Resolved", "Cancelled" };
    if (!validStatuses.Contains(newStatus))
    {
        return BadRequest("Invalid status.");
    }

    var request = await _context.ServiceRequests.FindAsync(id);
    if (request == null) return NotFound();

    // GET THE CURRENT USER'S ID
    var currentUserId = User.Claims
        .FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier && Guid.TryParse(c.Value, out _))?.Value;

    // PERMISSION CHECK:
    // Only a Worker/Admin can set things to "In Progress" or "Resolved".
    // A Resident can only set THEIR OWN request to "Cancelled".
    bool isWorker = User.IsInRole("Worker") || User.IsInRole("Admin");
    bool isOwner = request.UserId == currentUserId;

    if (!isWorker && (!isOwner || newStatus != "Cancelled"))
    {
        return Forbid(); // "You don't have permission to do that!"
    }

    request.Status = newStatus;
    await _context.SaveChangesAsync();

    return Ok(new { Message = $"Status updated to {newStatus}!" });
    }
}