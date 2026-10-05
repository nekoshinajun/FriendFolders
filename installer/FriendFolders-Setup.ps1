Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$form=New-Object System.Windows.Forms.Form; $form.Text="FriendFolders Setup"; $form.Size=New-Object System.Drawing.Size(520,340); $form.StartPosition="CenterScreen"; $form.FormBorderStyle="FixedDialog"; $form.MaximizeBox=$false
$title=New-Object System.Windows.Forms.Label; $title.Text="FriendFolders"; $title.Font=New-Object System.Drawing.Font("Segoe UI",20,[System.Drawing.FontStyle]::Bold); $title.AutoSize=$true; $title.Location=New-Object System.Drawing.Point(28,24); $form.Controls.Add($title)
$desc=New-Object System.Windows.Forms.Label; $desc.Text="Install or update FriendFolders for Vencord."; $desc.AutoSize=$true; $desc.Location=New-Object System.Drawing.Point(31,78); $form.Controls.Add($desc)
$status=New-Object System.Windows.Forms.Label; $status.Text="Ready to install."; $status.AutoSize=$true; $status.Location=New-Object System.Drawing.Point(31,125); $form.Controls.Add($status)
$progress=New-Object System.Windows.Forms.ProgressBar; $progress.Location=New-Object System.Drawing.Point(34,153); $progress.Size=New-Object System.Drawing.Size(435,20); $progress.Style="Marquee"; $progress.Visible=$false; $form.Controls.Add($progress)
$install=New-Object System.Windows.Forms.Button; $install.Text="Install / Update"; $install.Size=New-Object System.Drawing.Size(150,42); $install.Location=New-Object System.Drawing.Point(319,220); $form.Controls.Add($install)
$note=New-Object System.Windows.Forms.Label; $note.Text="Windows only. Internet required."; $note.AutoSize=$true; $note.Location=New-Object System.Drawing.Point(31,230); $form.Controls.Add($note)
$install.Add_Click({
 $install.Enabled=$false; $progress.Visible=$true; $status.Text="Installing..."; $form.Refresh()
 try {
  $script=Join-Path $env:TEMP "FriendFolders-install.ps1"
  Invoke-WebRequest "https://raw.githubusercontent.com/nekoshinajun/FriendFolders/main/install.ps1" -OutFile $script
  $p=Start-Process powershell.exe -ArgumentList "-NoProfile","-ExecutionPolicy","Bypass","-File",("\""+$script+"\"") -Wait -PassThru
  if($p.ExitCode -ne 0){throw "Installer exited with code $($p.ExitCode)."}
  $status.Text="Finished. Restart Discord and enable FriendFolders."
  [System.Windows.Forms.MessageBox]::Show("Installation finished. Restart Discord, then enable FriendFolders in Settings > Vencord > Plugins.","FriendFolders")|Out-Null
 } catch { $status.Text="Installation failed."; [System.Windows.Forms.MessageBox]::Show($_.Exception.Message,"FriendFolders Setup")|Out-Null }
 finally { $progress.Visible=$false; $install.Enabled=$true }
})
[void]$form.ShowDialog()