namespace CBSstaj.Requests
{
    public class UpdatePointRequest
    {
        public string Geometry { get; set; } = string.Empty; 
        public string? Name { get; set; }
    }
}
