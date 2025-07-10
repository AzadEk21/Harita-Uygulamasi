namespace CBSstaj.Responses
{
    public class ApiResponse<T>
    {
        public T? Value { get; set; } = default!; 
        public bool Result { get; set; } = false; 
        public string Message { get; set; } = string.Empty; 

        public ApiResponse() { }

        public ApiResponse(T value, bool result, string message)
        {
            Value = value;
            Result = result;
            Message = message;
        }
    }
}
