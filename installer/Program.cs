using System.Diagnostics;
using System.IO.Compression;
using System.Net.Http;

namespace FriendFoldersSetup;

internal static class Program {
    static readonly HttpClient Http = new();
    [STAThread] static void Main() { ApplicationConfiguration.Initialize(); Application.Run(new SetupForm()); }

    sealed class SetupForm : Form {
        readonly Label status = new(){Left=28,Top=112,Width=440,Text="Ready to install."};
        readonly ProgressBar bar = new(){Left=28,Top=145,Width=440,Style=ProgressBarStyle.Marquee,Visible=false};
        readonly Button install = new(){Left=318,Top=215,Width=150,Height=42,Text="Install / Update"};
        public SetupForm() {
            Text="FriendFolders Setup"; ClientSize=new(500,290); StartPosition=FormStartPosition.CenterScreen; FormBorderStyle=FormBorderStyle.FixedDialog; MaximizeBox=false;
            Controls.Add(new Label{Left=28,Top=22,Width=440,Height=42,Text="FriendFolders",Font=new Font("Segoe UI",20,FontStyle.Bold)});
            Controls.Add(new Label{Left=30,Top=72,Width=440,Text="Install FriendFolders and the required Vencord source build."});
            Controls.Add(status); Controls.Add(bar); Controls.Add(new Label{Left=30,Top=222,Width=270,Height=40,Text="Windows 10/11 · Internet connection required"}); Controls.Add(install);
            install.Click += async (_,_) => await Install();
        }
        async Task Install() {
            install.Enabled=false; bar.Visible=true;
            try {
                await EnsureCommand("git","Git.Git","Git");
                await EnsureCommand("node","OpenJS.NodeJS.LTS","Node.js LTS");
                await EnsurePnpm();
                var home=Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
                var vencord=Path.Combine(home,"Vencord");
                if(!Directory.Exists(Path.Combine(vencord,".git"))) await Run("git",$"clone https://github.com/Vendicated/Vencord \"{vencord}\"");
                else await Run("git",$"-C \"{vencord}\" pull --ff-only");
                Set("Installing Vencord dependencies..."); await Run("pnpm","install --frozen-lockfile",vencord);
                var plugins=Path.Combine(vencord,"src","userplugins"); Directory.CreateDirectory(plugins);
                var target=Path.Combine(plugins,"friendFolders");
                if(Directory.Exists(target)) Directory.Delete(target,true);
                var zip=Path.Combine(Path.GetTempPath(),"FriendFolders-main.zip");
                var bytes=await Http.GetByteArrayAsync("https://github.com/nekoshinajun/FriendFolders/archive/refs/heads/main.zip");
                await File.WriteAllBytesAsync(zip,bytes);
                var temp=Path.Combine(Path.GetTempPath(),"FriendFolders-"+Guid.NewGuid()); ZipFile.ExtractToDirectory(zip,temp);
                Directory.Move(Path.Combine(temp,"FriendFolders-main"),target);
                foreach(var name in new[]{".git",".github","installer","README.md","README.ja.md","LICENSE","install.ps1"}) { var p=Path.Combine(target,name); if(Directory.Exists(p)) Directory.Delete(p,true); else if(File.Exists(p)) File.Delete(p); }
                Set("Building Vencord..."); await Run("pnpm","build",vencord);
                Set("Opening Vencord Installer..."); await Run("pnpm","inject",vencord);
                Set("Finished."); MessageBox.Show("Installation finished. Restart Discord, then enable FriendFolders in Settings > Vencord > Plugins.","FriendFolders",MessageBoxButtons.OK,MessageBoxIcon.Information);
            } catch(Exception ex) { Set("Installation failed."); MessageBox.Show(ex.Message,"FriendFolders Setup",MessageBoxButtons.OK,MessageBoxIcon.Error); }
            finally { bar.Visible=false; install.Enabled=true; }
        }
        async Task EnsureCommand(string cmd,string wingetId,string label) { if(CommandExists(cmd)) return; Set($"Installing {label}..."); await Run("winget",$"install --id {wingetId} -e --accept-package-agreements --accept-source-agreements"); RefreshPath(); if(!CommandExists(cmd)) throw new Exception($"{label} was installed, but Windows has not exposed it yet. Restart Setup and try again."); }
        async Task EnsurePnpm(){ if(CommandExists("pnpm")) return; Set("Installing pnpm..."); await Run("npm","install -g pnpm"); RefreshPath(); if(!CommandExists("pnpm")) throw new Exception("pnpm installation completed, but it is not available yet. Restart Setup and try again."); }
        bool CommandExists(string c){ try { using var p=Process.Start(new ProcessStartInfo("where.exe",c){UseShellExecute=false,CreateNoWindow=true}); p!.WaitForExit(); return p.ExitCode==0; } catch{return false;} }
        void RefreshPath(){ var m=Environment.GetEnvironmentVariable("Path",EnvironmentVariableTarget.Machine); var u=Environment.GetEnvironmentVariable("Path",EnvironmentVariableTarget.User); Environment.SetEnvironmentVariable("Path",m+";"+u); }
        async Task Run(string file,string args,string? cwd=null){ var psi=new ProcessStartInfo(file,args){UseShellExecute=false,WorkingDirectory=cwd??Environment.CurrentDirectory}; using var p=Process.Start(psi)??throw new Exception($"Could not start {file}."); await p.WaitForExitAsync(); if(p.ExitCode!=0) throw new Exception($"{file} failed with exit code {p.ExitCode}."); }
        void Set(string s){ status.Text=s; status.Refresh(); }
    }
}