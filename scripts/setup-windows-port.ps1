# Run in Windows PowerShell AS ADMINISTRATOR
# Forwards Windows 127.0.0.1:5050 -> WSL YouTube Growth Hub (fixes "connection refused")

$port = 5050
$wslIp = (wsl -e hostname -I).Trim().Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)[0]

if (-not $wslIp) {
    Write-Error "Could not get WSL IP. Is WSL running?"
    exit 1
}

netsh interface portproxy delete v4tov4 listenport=$port listenaddress=127.0.0.1 2>$null
netsh interface portproxy add v4tov4 listenport=$port listenaddress=127.0.0.1 connectport=$port connectaddress=$wslIp

# Allow through Windows Firewall (ignore if rule exists)
netsh advfirewall firewall delete rule name="YouTube Growth Hub $port" 2>$null
netsh advfirewall firewall add rule name="YouTube Growth Hub $port" dir=in action=allow protocol=TCP localport=$port

Write-Host ""
Write-Host "OK: Windows 127.0.0.1:${port} -> WSL ${wslIp}:${port}"
Write-Host ""
Write-Host "Test in browser: http://127.0.0.1:${port}/oauth-setup"
Write-Host ""
Write-Host "Note: WSL IP changes after reboot — re-run this script if auth breaks again."
Write-Host "Port 5000 is PowerShell Universal — do not use 5000 for this app."