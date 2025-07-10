using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using CBSstaj.Data;
using CBSstaj.Models;
using System.Text.RegularExpressions;

namespace CBSstaj.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("me")]
        public IActionResult GetMyInfo()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);

            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            return Ok(user);
        }

        [Authorize]
        [HttpPut("password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            var hasher = new PasswordHasher<User>();
            var result = hasher.VerifyHashedPassword(user, user.PasswordHash, dto.OldPassword);

            if (result != PasswordVerificationResult.Success)
                return BadRequest("Eski şifre yanlış.");

            if (dto.OldPassword == dto.NewPassword)
                return BadRequest("Yeni şifre eski şifre ile aynı olamaz.");


            // Yeni şifre kuralları: En az 8 karakter, 1 büyük harf, 1 küçük harf, 1 rakam
            if (!Regex.IsMatch(dto.NewPassword, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"))
                return BadRequest("Yeni şifre en az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir.");

            user.PasswordHash = hasher.HashPassword(user, dto.NewPassword);
            _context.SaveChanges();

            return Ok("Şifre başarıyla değiştirildi.");
        }

        [Authorize]
        [HttpPost("photo")]
        public IActionResult UploadPhoto([FromBody] ProfilePhotoDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            user.ProfileImageBase64 = dto.Base64Image;
            _context.SaveChanges();

            return Ok("Profil fotoğrafı kaydedildi.");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("all")]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            _context.Users.Remove(user);
            _context.SaveChanges();
            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/role")]
        public IActionResult UpdateUserRole(int id, [FromBody] RoleUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Role))
                return BadRequest("Rol boş olamaz.");

            if (dto.Role != "Admin" && dto.Role != "User")
                return BadRequest("Geçersiz rol. Sadece 'Admin' veya 'User' olabilir.");

            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
                return NotFound("Kullanıcı bulunamadı.");

            user.Role = dto.Role;
            _context.SaveChanges();
            return Ok();
        }
    }

    public class RoleUpdateDto
    {
        public string Role { get; set; } = string.Empty;
    }

    public class ChangePasswordDto
    {
        public string OldPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class ProfilePhotoDto
    {
        public string Base64Image { get; set; } = string.Empty;
    }
}
