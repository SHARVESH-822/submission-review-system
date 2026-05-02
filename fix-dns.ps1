# Run this script as Administrator to fix DNS settings
# Right-click and select "Run with PowerShell" or "Run as Administrator"

# Set Google DNS for Wi-Fi adapter
Write-Host "Setting DNS to Google Public DNS (8.8.8.8)..." -ForegroundColor Green

netsh interface ipv4 set dnsservers "Wi-Fi" static 8.8.8.8 primary
netsh interface ipv4 add dnsservers "Wi-Fi" 8.8.4.4 index=2

# Verify the DNS was set
Write-Host "DNS configuration updated:" -ForegroundColor Green
netsh interface ipv4 show dnsservers

Write-Host "`nDNS has been successfully updated!" -ForegroundColor Green
Write-Host "You can now close this window and start npm run dev" -ForegroundColor Cyan

# Keep window open so you can see the results
Read-Host "Press Enter to exit"
