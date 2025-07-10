using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using CBSstaj.Models;
using CBSstaj.Data;
using CBSstaj.Services;
using CBSstaj.Helpers;
using CBSstaj.Requests;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace CBSstaj.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly EmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _hasher = new();

        public AuthController(ApplicationDbContext context, EmailService emailService, IConfiguration configuration)
        {
            _context = context;
            _emailService = emailService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterDto dto)
        {
            // 🔍 DTO loglama
            Console.WriteLine($"REGISTER DTO: Username={dto.Username}, Email={dto.Email}, Password={dto.Password}");
            Console.WriteLine($"EMAIL: {dto.Email} | USERNAME: {dto.Username}");


            if (_context.Users.Any(u => u.Username == dto.Username))
                return BadRequest("Bu kullanıcı adı zaten alınmış.");

            if (_context.Users.Any(u => u.Email == dto.Email))
                return BadRequest("Bu e-posta zaten kayıtlı.");

            var token = TokenHelper.GenerateToken();

            Console.WriteLine($"Üretilen token: {token}");

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email, // <-- burada boş mu?
                PasswordHash = _hasher.HashPassword(null!, dto.Password),
                EmailConfirmationToken = token,
                IsEmailConfirmed = false,
                Role = "User"
            };

            user.PasswordHash = _hasher.HashPassword(user, dto.Password);

            _context.Users.Add(user);
            _context.SaveChanges();

            string link = $"http://localhost:3000/verify-email?token={token}";
            string body = $"<p>Merhaba {dto.Username},</p><p>Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p><p><a href='{link}'>{link}</a></p>";

            _emailService.Send(dto.Email, "E-Posta Doğrulama", body);

            return Ok("Kayıt başarılı, doğrulama e-postası gönderildi.");
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Username == dto.Username);
            if (user == null)
                return Unauthorized("Kullanıcı bulunamadı.");

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password);
            if (result != PasswordVerificationResult.Success)
                return Unauthorized("Şifre yanlış.");

            if (!user.IsEmailConfirmed)
                return Unauthorized("E-posta doğrulanmamış.");


            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Issuer"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            return Ok(new
            {
                user.Id,
                user.Username,
                user.Role,
                Token = jwt
            });
        }

        [HttpPost("verify-email")]
        public IActionResult VerifyEmail([FromBody] VerifyEmailDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.EmailConfirmationToken == dto.Token);
            if (user == null)
                return BadRequest("Geçersiz doğrulama bağlantısı.");

            user.IsEmailConfirmed = true;
            user.EmailConfirmationToken = null;
            _context.SaveChanges();

            return Ok("E-posta doğrulandı.");
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == dto.Email);

            if (user == null)
            {
                // ❗ Kullanıcı bulunamadıysa 400 hatası ile mesaj dön
                return BadRequest(new { message = "Bu e-posta sistemde kayıtlı değil." });
            }

            var token = TokenHelper.GenerateToken();
            user.PasswordResetToken = token;
            user.PasswordResetExpiry = DateTime.UtcNow.AddMinutes(30);
            _context.SaveChanges();

            string link = $"http://localhost:3000/reset-password?token={token}";
            string body = $@"
        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
        <p><a href='{link}'>{link}</a></p>
        <p>Bu bağlantı yalnızca bir kez kullanılabilir ve 30 dakika için geçerlidir.</p>
    ";

            _emailService.Send(user.Email, "Şifre Sıfırlama", body);

            return Ok(new { message = "Şifre sıfırlama bağlantısı e-postanıza gönderildi." });
        }


        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDto dto)
        {
            // 1. Token geçerli mi?
            var user = _context.Users.FirstOrDefault(u => u.PasswordResetToken == dto.Token);
            if (user == null || user.PasswordResetExpiry < DateTime.UtcNow)
                return BadRequest(new { success = false, message = "Token geçersiz veya süresi dolmuş." });

            // 2. Yeni şifre boş olamaz
            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                return BadRequest(new { success = false, message = "Yeni şifre boş olamaz." });

            // 3. Şifre uzunluğu ve büyük harf kontrolü
            bool hasMinLength = dto.NewPassword.Length >= 8;
            bool hasUppercase = dto.NewPassword.Any(char.IsUpper);

            if (!hasMinLength || !hasUppercase)
                return BadRequest(new { success = false, message = "Şifre en az 8 karakter ve en az bir büyük harf içermelidir." });

            // 4. Aynı şifreyle güncelleme engeli
            var currentHashed = user.PasswordHash;
            var verification = new PasswordHasher<User>().VerifyHashedPassword(user, currentHashed, dto.NewPassword);

            if (verification == PasswordVerificationResult.Success)
                return BadRequest(new { success = false, message = "Yeni şifre, mevcut şifreyle aynı olamaz." });

            // 5. Şifre güncelleme işlemi
            user.PasswordHash = _hasher.HashPassword(user, dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetExpiry = null;

            _context.SaveChanges();

            return Ok(new { success = true, message = "Şifreniz başarıyla güncellendi." });
        }

    }
}
