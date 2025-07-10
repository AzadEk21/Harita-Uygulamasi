namespace CBSstaj.Requests
{
    public class AddPointRequest
    {
        public string Geometry { get; set; } = string.Empty;
        public string? Name { get; set; }
    }
}
