using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace OfisYonetimSistemi.Infrastructure.Services;

/// <summary>
/// Background service that automatically checks out expired reservations and marks no-shows
/// Runs every 5 minutes
/// </summary>
public class AutoCheckOutHostedService : BackgroundService
{
    private readonly ILogger<AutoCheckOutHostedService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5);

    public AutoCheckOutHostedService(ILogger<AutoCheckOutHostedService> logger, IServiceProvider serviceProvider)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("AutoCheckOutHostedService started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var checkOutService = scope.ServiceProvider.GetRequiredService<ICheckOutService>();
                    var checkedOutCount = await checkOutService.AutoCheckOutExpiredReservationsAsync();

                    if (checkedOutCount > 0)
                    {
                        _logger.LogInformation($"AutoCheckOut: Processed {checkedOutCount} reservations");
                    }
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in AutoCheckOutHostedService");
                // Continue running even if there's an error
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        _logger.LogInformation("AutoCheckOutHostedService stopped");
    }
}
