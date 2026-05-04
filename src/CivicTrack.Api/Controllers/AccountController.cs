using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CivicTrack.Api.DTOs;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;
    private readonly IConfiguration _configuration;

    public AccountController(UserManager<IdentityUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [HttpPost("register")]public async Task<IActionResult> Register([FromBody] CivicTrack.Api.DTOs.RegisterModel model)
{
    var user = new IdentityUser { UserName = model.Email, Email = model.Email };
    var result = await _userManager.CreateAsync(user, model.Password);

    if (result.Succeeded)
    {
        // Every new user becomes a Resident by default
        await _userManager.AddToRoleAsync(user, "Resident");
        
        return Ok(new AuthResponse { Success = true, Message = "User created as Resident!" });
    }

    return BadRequest(result.Errors);
}

    [HttpPost("login")]
public async Task<IActionResult> Login([FromBody] CivicTrack.Api.DTOs.LoginModel model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);
    if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
    {
        var token = await GenerateJwtToken(user);
        
        
        var roles = await _userManager.GetRolesAsync(user);
        
        
        var primaryRole = roles.FirstOrDefault() ?? "Resident";

        return Ok(new AuthResponse 
        { 
            Success = true, 
            Token = token,
            Role = primaryRole 
        });
    }
    return Unauthorized();
}
    private async Task<string> GenerateJwtToken(IdentityUser user)
    {
    var jwtKey = _configuration["Jwt:Key"] ?? "Your_Super_Secret_Key_At_Least_32_Chars";
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    // 1. Start with a List so we can add multiple claims
    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Email!),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new Claim(ClaimTypes.NameIdentifier, user.Id)
    };

    // 2. Fetch roles from DB and add each one to the claims list
    var roles = await _userManager.GetRolesAsync(user);
    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    // 3. Create the token using the 'claims' list
    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims, // This now includes the Roles!
        expires: DateTime.Now.AddHours(3),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
    }

    [Authorize(Roles = "Admin")]
    
    [HttpPost("promote-to-worker")]
        public async Task<IActionResult> PromoteToWorker(string email)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null) return NotFound("User not found");

        await _userManager.AddToRoleAsync(user, "Worker");
        return Ok($"{email} is now a City Worker.");
    }
}