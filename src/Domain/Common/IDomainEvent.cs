using MediatR;

namespace OfisYonetimSistemi.Domain.Common;

public interface IDomainEvent : INotification
{
    DateTime OccurredOn { get; }
}