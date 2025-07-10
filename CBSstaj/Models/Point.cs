namespace CBSstaj.Models
{
    public class Point
    {
        public int Id { get; set; }
        public string Geometry { get; set; } = string.Empty;
        public string? Name { get; set; } = string.Empty;
        public int UserId { get; set; }             
        public User? User { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
