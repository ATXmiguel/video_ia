# Keeps Windows from idle-sleeping until today's episode is published (state.json) or until $Until, then lets it sleep.
# Started by the Windows scheduled task "ShiftHappens-KeepAwake" (at logon and daily at 13:00, waking the PC).
param([string]$Until = "14:30")

Add-Type -Namespace Win32 -Name Power -MemberDefinition '[DllImport("kernel32.dll")] public static extern uint SetThreadExecutionState(uint esFlags);'
$ES_CONTINUOUS = [uint32]2147483648
$ES_SYSTEM_REQUIRED = [uint32]1

$state = Join-Path $PSScriptRoot '..\state.json'
$deadline = [datetime]::Today.Add([timespan]::Parse($Until))

function Test-PublishedToday {
    try {
        $s = Get-Content $state -Raw -Encoding UTF8 | ConvertFrom-Json
        $today = Get-Date -Format 'yyyy-MM-dd'
        return @($s.episodes | Where-Object { $_.published -eq $today }).Count -gt 0
    } catch {
        return $false
    }
}

if ((Get-Date) -ge $deadline -or (Test-PublishedToday)) { exit 0 }

[Win32.Power]::SetThreadExecutionState($ES_CONTINUOUS + $ES_SYSTEM_REQUIRED) | Out-Null
while ((Get-Date) -lt $deadline -and -not (Test-PublishedToday)) {
    Start-Sleep -Seconds 60
}
[Win32.Power]::SetThreadExecutionState($ES_CONTINUOUS) | Out-Null
