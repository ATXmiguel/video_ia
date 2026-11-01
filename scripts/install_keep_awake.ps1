# Run once (by you) to register the Windows task that keeps the PC awake until the daily episode is published.
# It starts scripts\keep_awake.ps1 at logon and every day at 13:00, waking the PC from sleep if needed.
# Remove it any time with:  schtasks /Delete /TN "ShiftHappens-KeepAwake" /F

$script = Join-Path $PSScriptRoot 'keep_awake.ps1'
$user = "$env:USERDOMAIN\$env:USERNAME"
$start = (Get-Date).ToString('yyyy-MM-dd') + 'T13:00:00'  # 30 min before the 13:30 routine
$xml = @"
<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.4" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Description>Keeps the PC awake until the daily Shift Happens episode is published (or 16:30).</Description></RegistrationInfo>
  <Triggers>
    <LogonTrigger><Enabled>true</Enabled><UserId>$user</UserId></LogonTrigger>
    <CalendarTrigger><StartBoundary>$start</StartBoundary><Enabled>true</Enabled><ScheduleByDay><DaysInterval>1</DaysInterval></ScheduleByDay></CalendarTrigger>
  </Triggers>
  <Principals><Principal id="Author"><UserId>$user</UserId><LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <StartWhenAvailable>true</StartWhenAvailable>
    <WakeToRun>true</WakeToRun>
    <ExecutionTimeLimit>PT12H</ExecutionTimeLimit>
    <IdleSettings><StopOnIdleEnd>false</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings>
  </Settings>
  <Actions Context="Author">
    <Exec><Command>powershell.exe</Command><Arguments>-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "$script"</Arguments></Exec>
  </Actions>
</Task>
"@
$tmp = Join-Path $env:TEMP 'shifthappens-keepawake.xml'
[System.IO.File]::WriteAllText($tmp, $xml, [System.Text.Encoding]::Unicode)
schtasks /Create /TN "ShiftHappens-KeepAwake" /XML $tmp /F
Remove-Item $tmp
schtasks /Run /TN "ShiftHappens-KeepAwake"
Write-Host "Done. The PC now stays awake each day until the episode is published (or 16:30)."
