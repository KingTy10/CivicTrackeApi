using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CivicTrack.Api.DTOs;
using CivicTrack.Data.Entities; // Import your custom User entity

// This maps AdminManager to your specific User class
using AdminManager = Microsoft.AspNetCore.Identity.UserManager<CivicTrack.Data.Entities.User>;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly AdminManager _userManager; 
    private readonly IConfiguration _configuration;

    public AccountController(AdminManager userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterModel model)
    {
        // Use your custom 'User' entity instead of 'IdentityUser'
        var user = new User { UserName = model.Email, Email = model.Email, CreatedAt = DateTime.UtcNow };
        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, "Resident");
            return Ok(new AuthResponse { Success = true, Message = "User created!" });
        }
        return BadRequest(result.Errors);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = _userManager.Users.ToList();
        var userList = new List<object>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            userList.Add(new { Id = user.Id, Email = user.Email, Role = roles.FirstOrDefault() ?? "Resident" });
        }
        return Ok(userList);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("promote-to-worker")]
    public async Task<IActionResult> PromoteToWorker([FromQuery] string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound("User not found");

        await _userManager.RemoveFromRoleAsync(user, "Resident");
        await _userManager.AddToRoleAsync(user, "Worker");
        return Ok($"{email} is now a Worker.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
        {
            var token = await GenerateJwtToken(user);
            return Ok(new AuthResponse { Success = true, Token = token });
        }
        return Unauthorized();
    }

    // Changed parameter to use your custom User entity
private async Task<string> GenerateJwtToken(User user)
{
    var jwtKey = _configuration["Jwt:Key"] ?? "Your_Super_Secret_Key_At_Least_32_Chars";
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        // Use ToString() on the Id to ensure it's a string for the Claim
        new Claim(JwtRegisteredClaimNames.Sub, user.Email ?? ""),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), 
        new Claim(ClaimTypes.Email, user.Email ?? "")
    };

    var roles = await _userManager.GetRolesAsync(user);
    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(3),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}

}
