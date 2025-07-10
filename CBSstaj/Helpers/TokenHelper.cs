using System.Security.Cryptography;

namespace CBSstaj.Helpers
{
    public static class TokenHelper
    {
        public static string GenerateToken(int length = 32)
        {
            var bytes = RandomNumberGenerator.GetBytes(length);
            // 64 karakterlik hex token
            return BitConverter.ToString(bytes).Replace("-", "").ToLower();
        }
    }

}
