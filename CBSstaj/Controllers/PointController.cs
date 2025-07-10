using CBSstaj.Interfaces;
using CBSstaj.Models;
using CBSstaj.Requests;
using CBSstaj.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CBSstaj.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PointController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public PointController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        [Authorize]
        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<PointDto>>>> GetAllPoints()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var role = User.FindFirst(ClaimTypes.Role)?.Value;

            IEnumerable<Point> points;

            if (role == "Admin")
            {
                points = await _unitOfWork.Repository<Point>()
                    .GetAllAsync(includeProperties: "User");
            }
            else
            {
                points = await _unitOfWork.Repository<Point>()
                    .GetAllAsync(p => p.UserId == userId, includeProperties: "User");
            }

            var dtoList = points.Select(p => new PointDto
            {
                Id = p.Id,
                Name = p.Name!,
                Geometry = p.Geometry,
                Username = p.User?.Username ?? "-",
                CreatedAt = p.CreatedAt // ✅ Eklendi
            }).ToList();

            return Ok(new ApiResponse<List<PointDto>>
            {
                Value = dtoList,
                Result = true,
                Message = "Noktalar başarıyla getirildi."
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<ActionResult<ApiResponse<Point>>> AddPoint([FromBody] AddPointRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var newPoint = new Point
            {
                Geometry = request.Geometry,
                Name = request.Name,
                UserId = userId,
                CreatedAt = DateTime.UtcNow // ✅ Ekleniyor (isteğe bağlı çünkü modelde default var)
            };

            await _unitOfWork.Repository<Point>().AddAsync(newPoint);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new ApiResponse<Point>
            {
                Value = newPoint,
                Result = true,
                Message = "Nokta başarıyla eklendi."
            });
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse<Point>>> GetPointById(int id)
        {
            var point = await _unitOfWork.Repository<Point>().GetByIdAsync(id);
            if (point == null)
                return NotFound(new ApiResponse<Point>
                {
                    Result = false,
                    Message = $"ID'si {id} olan nokta bulunamadı."
                });

            return Ok(new ApiResponse<Point>
            {
                Value = point,
                Result = true,
                Message = "Nokta başarıyla getirildi."
            });
        }

        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse<Point>>> UpdatePoint(int id, [FromBody] UpdatePointRequest request)
        {
            var existingPoint = await _unitOfWork.Repository<Point>().GetByIdAsync(id);
            if (existingPoint == null)
                return NotFound(new ApiResponse<Point>
                {
                    Result = false,
                    Message = $"ID'si {id} olan nokta bulunamadı. Güncelleme işlemi başarısız."
                });

            existingPoint.Geometry = request.Geometry;
            existingPoint.Name = request.Name;
            // Not: CreatedAt güncellenmiyor — yalnızca ilk oluşturulma zamanı olarak tutulur

            await _unitOfWork.Repository<Point>().UpdateAsync(existingPoint);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new ApiResponse<Point>
            {
                Value = existingPoint,
                Result = true,
                Message = "Nokta başarıyla güncellendi."
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse<bool>>> DeletePoint(int id)
        {
            var point = await _unitOfWork.Repository<Point>().GetByIdAsync(id);
            if (point == null)
                return NotFound(new ApiResponse<bool>
                {
                    Result = false,
                    Message = $"ID'si {id} olan nokta bulunamadı. Silme işlemi başarısız."
                });

            await _unitOfWork.Repository<Point>().RemoveAsync(point);
            await _unitOfWork.SaveChangesAsync();

            return Ok(new ApiResponse<bool>
            {
                Value = true,
                Result = true,
                Message = "Nokta başarıyla silindi."
            });
        }
    }

}
