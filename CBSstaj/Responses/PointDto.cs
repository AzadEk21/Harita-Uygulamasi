namespace CBSstaj.Responses
{

    public class PointDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Geometry { get; set; } = "";
        public string? Username { get; set; } = "-";
        public DateTime CreatedAt { get; set; }
    }

}
