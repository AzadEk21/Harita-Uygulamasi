namespace CBSstaj.Requests
{
    public class LoginDto
    {
        public string Username { get; set; } = string.Empty;  // veya E-posta da olabilir
        public string Password { get; set; } = string.Empty;
    }
}
