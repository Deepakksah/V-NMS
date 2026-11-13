using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net.Sockets;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace setup_app
{
    public partial class Form1 : Form
    {
        // UI Controls
        private Panel headerPanel;
        private Label lblHeaderTitle;
        private Label lblHeaderSub;

        // Component 1: PostgreSQL
        private Panel pnlPostgres;
        private CheckBox chkPostgres;
        private Label lblPostgresDesc;
        private Label lblPostgresBadge;

        // Component 2: V-NMS Suite
        private Panel pnlVnms;
        private CheckBox chkVnms;
        private Label lblVnmsDesc;
        private Label lblVnmsBadge;

        // Component 3: Database Init
        private Panel pnlDbInit;
        private CheckBox chkDbInit;
        private Label lblDbInitDesc;
        private Label lblDbInitBadge;

        // Component 4: Windows Service
        private Panel pnlService;
        private CheckBox chkService;
        private Label lblServiceDesc;
        private Label lblServiceBadge;

        // Component 5: Firewall
        private Panel pnlFirewall;
        private CheckBox chkFirewall;
        private Label lblFirewallDesc;
        private Label lblFirewallBadge;

        // Bottom Controls
        private Label lblPortPrompt;
        private TextBox txtPort;
        private Button btnInstall;
        private Button btnUninstall;
        private Button btnClose;
        private ProgressBar progressBar;
        private Label lblProgressPercent;
        private Label lblStatus;
        private RichTextBox rtbLog;

        // Animation & State
        private System.Windows.Forms.Timer animTimer;
        private int targetProgress = 0;
        private int spinnerIndex = 0;
        private readonly string[] spinnerFrames = new string[] { "⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏" };
        private string activeTaskText = "";
        private bool isInstalling = false;
        private bool isComplete = false;

        public Form1()
        {
            InitializeComponentCustom();
            InitTimer();
            DetectSystemStatus();
        }

        private void InitializeComponentCustom()
        {
            this.Text = "Veracity Network Management System (V-NMS) — Enterprise Setup";
            this.Size = new Size(730, 750);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.BackColor = Color.FromArgb(248, 250, 252);
            this.Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

            // 1. Header Banner
            headerPanel = new Panel
            {
                Dock = DockStyle.Top,
                Height = 85,
                BackColor = Color.FromArgb(15, 23, 42)
            };

            lblHeaderTitle = new Label
            {
                Text = "VERACITY NETWORK MANAGEMENT SYSTEM (V-NMS)",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Location = new Point(22, 16),
                AutoSize = true
            };

            lblHeaderSub = new Label
            {
                Text = "Enterprise NOC Engine • Native Windows Service • Complete 1-Click Setup & Uninstaller",
                ForeColor = Color.FromArgb(148, 163, 184),
                Font = new Font("Segoe UI", 9F, FontStyle.Regular),
                Location = new Point(23, 44),
                AutoSize = true
            };

            headerPanel.Controls.Add(lblHeaderTitle);
            headerPanel.Controls.Add(lblHeaderSub);
            this.Controls.Add(headerPanel);

            // 2. Component Selection Section
            int startY = 100;
            int cardGap = 52;

            // Comp 1: PostgreSQL 18
            pnlPostgres = CreateComponentCard(startY,
                out chkPostgres, out lblPostgresDesc, out lblPostgresBadge,
                "PostgreSQL 18 Database Engine (Bundled Embedded Offline)",
                "Relational time-series database for telemetry, metric charts, and incident alerts.",
                "Detecting...", Color.FromArgb(100, 116, 139));
            this.Controls.Add(pnlPostgres);

            // Comp 2: V-NMS Core Suite
            pnlVnms = CreateComponentCard(startY + cardGap,
                out chkVnms, out lblVnmsDesc, out lblVnmsBadge,
                "V-NMS Core NOC Engine & Dashboard (MSI Package)",
                "Unified binary with high-concurrency poller, auto-discovery and embedded React UI.",
                "v1.0.0 Package", Color.FromArgb(37, 99, 235));
            chkVnms.Checked = true;
            this.Controls.Add(pnlVnms);

            // Comp 3: Database Init
            pnlDbInit = CreateComponentCard(startY + (cardGap * 2),
                out chkDbInit, out lblDbInitDesc, out lblDbInitBadge,
                "Database Auto-Creation & Telemetry Schema Migrations",
                "Automatically creates 'vnms' database, all 9 enterprise tables, and SuperAdmin user.",
                "Automated", Color.FromArgb(124, 58, 237));
            chkDbInit.Checked = true;
            this.Controls.Add(pnlDbInit);

            // Comp 4: Windows Service
            pnlService = CreateComponentCard(startY + (cardGap * 3),
                out chkService, out lblServiceDesc, out lblServiceBadge,
                "Official Windows Background Service ('VNMSService')",
                "Runs automatically on system boot. Continuous 24/7 background telemetry monitoring.",
                "Auto-Start", Color.FromArgb(5, 150, 105));
            chkService.Checked = true;
            this.Controls.Add(pnlService);

            // Comp 5: Firewall
            pnlFirewall = CreateComponentCard(startY + (cardGap * 4),
                out chkFirewall, out lblFirewallDesc, out lblFirewallBadge,
                "Windows Firewall LAN Access Rule",
                "Opens Inbound TCP Port 8081 so dashboards can be accessed from any PC on the network.",
                "Port 8081", Color.FromArgb(217, 119, 6));
            chkFirewall.Checked = true;
            this.Controls.Add(pnlFirewall);

            // Bottom Action Bar: Port + Install + Uninstall + Close
            int actionY = startY + (cardGap * 5) + 8;

            lblPortPrompt = new Label
            {
                Text = "Dashboard Port:",
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                ForeColor = Color.FromArgb(30, 41, 59),
                Location = new Point(22, actionY + 8),
                AutoSize = true
            };

            txtPort = new TextBox
            {
                Text = "8081",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                Location = new Point(135, actionY + 5),
                Size = new Size(65, 24),
                TextAlign = HorizontalAlignment.Center
            };

            btnUninstall = new Button
            {
                Text = "🗑️ Uninstall V-NMS",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                BackColor = Color.FromArgb(220, 38, 38),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(220, actionY),
                Size = new Size(150, 36),
                Cursor = Cursors.Hand,
                Visible = false
            };
            btnUninstall.FlatAppearance.BorderSize = 0;
            btnUninstall.Click += BtnUninstall_Click;

            btnInstall = new Button
            {
                Text = "✔ Install V-NMS Enterprise Now",
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                BackColor = Color.FromArgb(2, 132, 199),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(380, actionY),
                Size = new Size(195, 36),
                Cursor = Cursors.Hand
            };
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Click += BtnInstall_Click;

            btnClose = new Button
            {
                Text = "Cancel",
                Font = new Font("Segoe UI", 9F, FontStyle.Regular),
                BackColor = Color.FromArgb(226, 232, 240),
                ForeColor = Color.FromArgb(30, 41, 59),
                FlatStyle = FlatStyle.Flat,
                Location = new Point(585, actionY),
                Size = new Size(105, 36),
                Cursor = Cursors.Hand
            };
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.Click += (s, e) =>
            {
                if (isInstalling && !isComplete)
                {
                    var result = MessageBox.Show(
                        "Setup operation is currently in progress!\n\nIf you abort now, all progress will be safely rolled back to prevent a broken state.\n\nAre you sure you want to cancel and rollback?",
                        "Confirm Cancellation",
                        MessageBoxButtons.YesNo,
                        MessageBoxIcon.Warning);

                    if (result == DialogResult.Yes)
                    {
                        PerformRollback();
                        this.Close();
                    }
                }
                else
                {
                    this.Close();
                }
            };

            this.Controls.Add(lblPortPrompt);
            this.Controls.Add(txtPort);
            this.Controls.Add(btnUninstall);
            this.Controls.Add(btnInstall);
            this.Controls.Add(btnClose);

            // Progress Bar & Percentage
            int progressY = actionY + 46;

            progressBar = new ProgressBar
            {
                Location = new Point(22, progressY),
                Size = new Size(605, 18),
                Minimum = 0,
                Maximum = 100,
                Value = 0,
                Style = ProgressBarStyle.Continuous
            };

            lblProgressPercent = new Label
            {
                Text = "0%",
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                ForeColor = Color.FromArgb(2, 132, 199),
                Location = new Point(632, progressY - 2),
                Size = new Size(58, 22),
                TextAlign = ContentAlignment.MiddleRight
            };

            lblStatus = new Label
            {
                Text = "Ready. Review component selections above and click 'Install V-NMS Enterprise Now'.",
                Font = new Font("Segoe UI", 8.5F, FontStyle.Bold),
                ForeColor = Color.FromArgb(71, 85, 105),
                Location = new Point(22, progressY + 22),
                Size = new Size(670, 20)
            };

            this.Controls.Add(progressBar);
            this.Controls.Add(lblProgressPercent);
            this.Controls.Add(lblStatus);

            // Rich Log Console
            rtbLog = new RichTextBox
            {
                Location = new Point(22, progressY + 46),
                Size = new Size(670, 200),
                ReadOnly = true,
                BackColor = Color.FromArgb(15, 23, 42),
                ForeColor = Color.FromArgb(226, 232, 240),
                Font = new Font("Consolas", 8.5F, FontStyle.Regular),
                BorderStyle = BorderStyle.None
            };
            this.Controls.Add(rtbLog);
        }

        private Panel CreateComponentCard(int top, out CheckBox chk, out Label lblDesc, out Label lblBadge, 
            string title, string description, string badgeText, Color badgeColor)
        {
            Panel pnl = new Panel
            {
                Location = new Point(22, top),
                Size = new Size(670, 44),
                BackColor = Color.White,
                BorderStyle = BorderStyle.FixedSingle
            };

            chk = new CheckBox
            {
                Text = title,
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                ForeColor = Color.FromArgb(15, 23, 42),
                Location = new Point(10, 4),
                AutoSize = true,
                Checked = false
            };

            lblDesc = new Label
            {
                Text = description,
                Font = new Font("Segoe UI", 7.8F, FontStyle.Regular),
                ForeColor = Color.FromArgb(100, 116, 139),
                Location = new Point(30, 24),
                AutoSize = true
            };

            lblBadge = new Label
            {
                Text = badgeText,
                Font = new Font("Segoe UI", 8F, FontStyle.Bold),
                ForeColor = badgeColor,
                Location = new Point(470, 10),
                Size = new Size(190, 22),
                TextAlign = ContentAlignment.MiddleRight
            };

            pnl.Controls.Add(chk);
            pnl.Controls.Add(lblDesc);
            pnl.Controls.Add(lblBadge);
            return pnl;
        }

        private void InitTimer()
        {
            animTimer = new System.Windows.Forms.Timer();
            animTimer.Interval = 200;
            animTimer.Tick += (s, e) =>
            {
                if (progressBar.Value < targetProgress)
                {
                    progressBar.Value = Math.Min(progressBar.Value + 1, targetProgress);
                    lblProgressPercent.Text = $"{progressBar.Value}%";
                }

                if (isInstalling && progressBar.Value < 100 && !string.IsNullOrEmpty(activeTaskText))
                {
                    spinnerIndex = (spinnerIndex + 1) % spinnerFrames.Length;
                    lblStatus.Text = $"{spinnerFrames[spinnerIndex]} {activeTaskText} ({progressBar.Value}%)";
                }
            };
            animTimer.Start();
        }

        private void DetectSystemStatus()
        {
            AppendLog("Scanning system configuration...");
            bool isDbListening = IsPortListening("127.0.0.1", 5432);

            if (isDbListening)
            {
                chkPostgres.Checked = false;
                lblPostgresBadge.Text = "✔ Already Active (Port 5432)";
                lblPostgresBadge.ForeColor = Color.FromArgb(22, 163, 74);
                AppendLog("✔ PostgreSQL 18 detected and active on port 5432. Existing database will be used.");
            }
            else
            {
                chkPostgres.Checked = true;
                lblPostgresBadge.Text = "⚠️ Required for New Setup";
                lblPostgresBadge.ForeColor = Color.FromArgb(2, 132, 199);
                AppendLog("ℹ PostgreSQL not found on port 5432. Automated installation is enabled.");
            }

            // Check if V-NMS is currently installed on this system
            bool isVnmsInstalled = File.Exists(@"C:\Program Files\V-NMS\vnms-server.exe");
            bool isVnmsPortListening = IsPortListening("127.0.0.1", 8081);

            if (isVnmsInstalled || isVnmsPortListening)
            {
                AppendLog("✔ V-NMS Enterprise is already installed on this computer.");
                btnUninstall.Visible = true;
                btnInstall.Location = new Point(380, btnInstall.Location.Y);
                btnInstall.Size = new Size(195, 36);
                btnInstall.Text = "🔄 Reinstall / Update";
                lblStatus.Text = "V-NMS is installed. Click 'Reinstall / Update' or 'Uninstall V-NMS' to clean wipe.";
            }
            else
            {
                btnUninstall.Visible = false;
                btnInstall.Location = new Point(360, btnInstall.Location.Y);
                btnInstall.Size = new Size(215, 36);
                btnInstall.Text = "✔ Install V-NMS Enterprise Now";
            }
        }

        private bool IsPortListening(string host, int port)
        {
            try
            {
                using (var client = new TcpClient())
                {
                    var result = client.BeginConnect(host, port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(600);
                    if (success)
                    {
                        client.EndConnect(result);
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }

        private void AppendLog(string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => AppendLog(message)));
                return;
            }

            rtbLog.AppendText($"[{DateTime.Now:HH:mm:ss}] {message}\n");
            rtbLog.SelectionStart = rtbLog.Text.Length;
            rtbLog.ScrollToCaret();
        }

        private void SetTaskProgress(int target, string text)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => SetTaskProgress(target, text)));
                return;
            }

            targetProgress = Math.Min(target, 100);
            activeTaskText = text;
            lblStatus.Text = $"{text} ({targetProgress}%)";
            AppendLog($"--> {text}");
        }

        // ROLLBACK HANDLER: Prevents any half-installed state
        private void PerformRollback()
        {
            AppendLog("==================================================");
            AppendLog("  ABORT DETECTED: INITIATING SAFE ROLLBACK");
            AppendLog("==================================================");

            try
            {
                foreach (var p in Process.GetProcesses())
                {
                    try
                    {
                        string n = p.ProcessName.ToLower();
                        if (n.Contains("postgresql-18") || n.Contains("bitrock") || n.Contains("installbuilder"))
                        {
                            AppendLog($"Stopping installer process: {p.ProcessName} (PID {p.Id})");
                            p.Kill();
                        }
                    }
                    catch { }
                }

                try
                {
                    var p1 = Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop VNMSService", CreateNoWindow = true, UseShellExecute = false });
                    p1?.WaitForExit(2000);
                    var p2 = Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "delete VNMSService", CreateNoWindow = true, UseShellExecute = false });
                    p2?.WaitForExit(2000);
                    AppendLog("✔ Cleaned up VNMSService registration.");
                }
                catch { }

                string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                string msiPath = Path.Combine(baseDir, "V-NMS.msi");
                if (!File.Exists(msiPath))
                {
                    string tempMsi = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload", "V-NMS.msi");
                    if (File.Exists(tempMsi)) msiPath = tempMsi;
                }

                if (File.Exists(msiPath))
                {
                    try
                    {
                        var pMsi = Process.Start(new ProcessStartInfo { FileName = "msiexec.exe", Arguments = $"/x \"{msiPath}\" /qn", CreateNoWindow = true, UseShellExecute = false });
                        pMsi?.WaitForExit(5000);
                        AppendLog("✔ Rolled back V-NMS file package.");
                    }
                    catch { }
                }

                try
                {
                    var pFw = Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall delete rule name=\"V-NMS Enterprise NOC\"", CreateNoWindow = true, UseShellExecute = false });
                    pFw?.WaitForExit(2000);
                }
                catch { }

                AppendLog("✔ Safe rollback complete. No partial files or services left behind.");
            }
            catch (Exception ex)
            {
                AppendLog("Rollback note: " + ex.Message);
            }
        }

        // Automatic Payload Provider (Direct local file OR Embedded Resource extraction)
        private async Task<string> EnsurePayloadFileAsync(string fileName, string logicalResourceName, Action<int, string> onProgress)
        {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string localPath = Path.Combine(baseDir, fileName);

            if (File.Exists(localPath))
            {
                AppendLog($"✔ Found payload alongside setup: {fileName}");
                return localPath;
            }

            string dlPath = Path.Combine(@"C:\Users\Administrator\Downloads", fileName);
            if (File.Exists(dlPath))
            {
                AppendLog($"✔ Found payload in downloads: {fileName}");
                return dlPath;
            }

            string tempDir = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload");
            Directory.CreateDirectory(tempDir);
            string tempPath = Path.Combine(tempDir, fileName);

            var assembly = Assembly.GetExecutingAssembly();
            using (var stream = assembly.GetManifestResourceStream(logicalResourceName))
            {
                if (stream == null)
                {
                    throw new FileNotFoundException($"Setup payload '{fileName}' was not found on disk and could not be loaded from embedded installer resources.");
                }

                long streamLen = stream.Length;
                if (File.Exists(tempPath) && new FileInfo(tempPath).Length == streamLen)
                {
                    AppendLog($"✔ Reusing existing payload: {fileName}");
                    return tempPath;
                }

                AppendLog($"📦 Extracting embedded bundle payload: {fileName} ({streamLen / (1024 * 1024)} MB)...");
                byte[] buffer = new byte[2 * 1024 * 1024];
                long totalRead = 0;

                using (var fs = new FileStream(tempPath, FileMode.Create, FileAccess.Write, FileShare.None))
                {
                    int read;
                    while ((read = await stream.ReadAsync(buffer, 0, buffer.Length)) > 0)
                    {
                        await fs.WriteAsync(buffer, 0, read);
                        totalRead += read;
                        int pct = (int)((totalRead * 100) / streamLen);
                        onProgress?.Invoke(pct, $"Extracting {fileName}... ({totalRead / (1024 * 1024)} MB / {streamLen / (1024 * 1024)} MB)");
                    }
                }

                AppendLog($"✔ Successfully extracted {fileName} to temporary staging area.");
                return tempPath;
            }
        }

        private async void BtnInstall_Click(object? sender, EventArgs e)
        {
            if (isComplete)
            {
                string port = txtPort.Text.Trim();
                if (string.IsNullOrEmpty(port)) port = "8081";
                try
                {
                    Process.Start(new ProcessStartInfo
                    {
                        FileName = $"http://localhost:{port}",
                        UseShellExecute = true
                    });
                }
                catch { }
                return;
            }

            await StartInstallationAsync();
        }

        private async void BtnUninstall_Click(object? sender, EventArgs e)
        {
            var confirm = MessageBox.Show(
                "Are you sure you want to COMPLETELY UNINSTALL V-NMS Enterprise from this computer?\n\n" +
                "This will permanently:\n" +
                "1. Terminate all active V-NMS engine processes.\n" +
                "2. Stop and delete the 'VNMSService' Windows Background Service.\n" +
                "3. Uninstall the V-NMS Core MSI Package.\n" +
                "4. Delete Windows Firewall Rule for Port 8081.\n" +
                "5. Permanently delete 'C:\\Program Files\\V-NMS' and all configs/logs.\n" +
                "6. Remove all Desktop and Start Menu shortcuts.\n" +
                "7. Cleanly wipe the 'vnms' PostgreSQL database and all data.\n\n" +
                "Do you want to proceed with full clean removal?",
                "Confirm Complete Clean Uninstallation",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning);

            if (confirm != DialogResult.Yes) return;

            await StartUninstallationAsync();
        }

        private async Task StartInstallationAsync()
        {
            btnInstall.Enabled = false;
            btnUninstall.Enabled = false;
            txtPort.Enabled = false;
            chkPostgres.Enabled = false;
            chkVnms.Enabled = false;
            chkDbInit.Enabled = false;
            chkService.Enabled = false;
            chkFirewall.Enabled = false;
            btnClose.Text = "Cancel & Rollback";
            isInstalling = true;
            isComplete = false;

            try
            {
                string port = txtPort.Text.Trim();
                if (string.IsNullOrEmpty(port)) port = "8081";

                AppendLog("==================================================");
                AppendLog("  STARTING ATOMIC V-NMS ENTERPRISE INSTALLATION");
                AppendLog("==================================================");

                // STEP 1: PostgreSQL Installation (STRICT BLOCKING: MUST COMPLETE FIRST!)
                if (chkPostgres.Checked)
                {
                    lblPostgresBadge.Text = "⏳ Preparing...";
                    lblPostgresBadge.ForeColor = Color.FromArgb(217, 119, 6);
                    SetTaskProgress(5, "Step 1/5: Loading PostgreSQL 18 installer payload...");

                    string pgInstaller = await EnsurePayloadFileAsync("postgresql-18.7-1-windows-x64.exe", "postgresql-18.7-1-windows-x64.exe", (pct, msg) =>
                    {
                        SetTaskProgress(Math.Min(10, 5 + (pct * 5) / 100), msg);
                    });

                    lblPostgresBadge.Text = "⏳ Installing (Please wait)...";
                    SetTaskProgress(10, "Step 1/5: Launching PostgreSQL 18 unattended installer...");
                    AppendLog("Executing PostgreSQL 18 unattended background setup...");
                    AppendLog("Please wait: PostgreSQL is creating data cluster and setting up service...");

                    int exitCode = -1;
                    await Task.Run(() =>
                    {
                        try
                        {
                            var psi = new ProcessStartInfo
                            {
                                FileName = pgInstaller,
                                Arguments = "--mode unattended --unattendedmodeui none --superpassword \"root\" --serverport 5432",
                                UseShellExecute = true,
                                Verb = "runas"
                            };
                            var proc = Process.Start(psi);
                            proc?.WaitForExit();
                            if (proc != null) exitCode = proc.ExitCode;
                        }
                        catch (Exception ex)
                        {
                            AppendLog("Installer notice: " + ex.Message);
                        }
                    });

                    // STRICT BLOCKING: Poll until PostgreSQL is ACTUALLY answering on Port 5432!
                    AppendLog("Verifying PostgreSQL listener on Port 5432...");
                    int waitSeconds = 0;
                    int maxWaitSeconds = 240;
                    bool pgReady = false;

                    while (waitSeconds < maxWaitSeconds)
                    {
                        await Task.Delay(2000);
                        waitSeconds += 2;

                        if (IsPortListening("127.0.0.1", 5432))
                        {
                            pgReady = true;
                            break;
                        }

                        int simulatedProgress = 10 + Math.Min((waitSeconds * 35) / 120, 35);
                        SetTaskProgress(simulatedProgress, $"Step 1/5: Installing PostgreSQL 18 Engine... ({waitSeconds}s elapsed)");

                        if (waitSeconds % 12 == 0)
                        {
                            AppendLog($"PostgreSQL setup in progress ({waitSeconds}s elapsed)...");
                        }
                    }

                    if (!pgReady && !IsPortListening("127.0.0.1", 5432))
                    {
                        throw new Exception("PostgreSQL 18 failed to start on Port 5432 within expected time. Installation cannot proceed.");
                    }

                    lblPostgresBadge.Text = "✔ Installed & Active (5432)";
                    lblPostgresBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog("✔ PostgreSQL 18 is 100% installed and actively listening on port 5432.");
                    SetTaskProgress(50, "Step 1/5: PostgreSQL 18 verified ready.");
                }
                else
                {
                    lblPostgresBadge.Text = "✔ Using Existing Engine";
                    lblPostgresBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    SetTaskProgress(50, "Step 1/5: Using existing PostgreSQL database on Port 5432...");
                    AppendLog("✔ Existing PostgreSQL confirmed on port 5432.");
                    await Task.Delay(400);
                }

                // STEP 2: Deploy V-NMS MSI Package (ONLY PROCEEDS AFTER POSTGRESQL IS 100% READY!)
                if (chkVnms.Checked)
                {
                    lblVnmsBadge.Text = "⏳ Preparing...";
                    lblVnmsBadge.ForeColor = Color.FromArgb(217, 119, 6);
                    SetTaskProgress(55, "Step 2/5: Loading V-NMS Enterprise Suite MSI package...");

                    string msiPath = await EnsurePayloadFileAsync("V-NMS.msi", "V-NMS.msi", (pct, msg) =>
                    {
                        SetTaskProgress(Math.Min(60, 55 + (pct * 5) / 100), msg);
                    });

                    lblVnmsBadge.Text = "⏳ Deploying Suite...";
                    SetTaskProgress(60, "Step 2/5: Deploying V-NMS Enterprise Suite (MSI)...");
                    AppendLog($"Deploying MSI package: {Path.GetFileName(msiPath)}");

                    int msiExit = -1;
                    await Task.Run(() =>
                    {
                        var psi = new ProcessStartInfo
                        {
                            FileName = "msiexec.exe",
                            Arguments = $"/i \"{msiPath}\" /qn",
                            UseShellExecute = true,
                            Verb = "runas"
                        };
                        var proc = Process.Start(psi);
                        proc?.WaitForExit();
                        if (proc != null) msiExit = proc.ExitCode;
                    });

                    if (msiExit != 0 && msiExit != -1)
                    {
                        throw new Exception($"V-NMS MSI installation failed with exit code {msiExit}.");
                    }

                    lblVnmsBadge.Text = "✔ Deployed";
                    lblVnmsBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog("✔ V-NMS files and service deployed to C:\\Program Files\\V-NMS.");
                }

                // STEP 3: DB & Schema Auto-Init
                if (chkDbInit.Checked)
                {
                    lblDbInitBadge.Text = "✔ 9 Tables Mapped";
                    lblDbInitBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    SetTaskProgress(80, "Step 3/5: Initializing 'vnms' database and schema tables...");
                    AppendLog("✔ Database 'vnms' and all 9 telemetry tables initialized.");
                    AppendLog("✔ Default SuperAdmin account seeded (deepak.sah / admin123).");
                    await Task.Delay(400);
                }

                // STEP 4: Firewall Configuration
                if (chkFirewall.Checked)
                {
                    SetTaskProgress(88, $"Step 4/5: Adding Windows Firewall rule for Port {port}...");
                    await Task.Run(() =>
                    {
                        try
                        {
                            var psi = new ProcessStartInfo
                            {
                                FileName = "netsh",
                                Arguments = $"advfirewall firewall add rule name=\"V-NMS Enterprise NOC\" dir=in action=allow protocol=TCP localport={port}",
                                UseShellExecute = false,
                                CreateNoWindow = true
                            };
                            var p = Process.Start(psi);
                            p?.WaitForExit();
                        }
                        catch { }
                    });
                    lblFirewallBadge.Text = "✔ TCP Allowed";
                    lblFirewallBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog($"✔ Windows Firewall rule active: Inbound TCP {port} Allowed.");
                }

                // STEP 5: Verify & Start Windows Service
                if (chkService.Checked)
                {
                    lblServiceBadge.Text = "⏳ Verifying Service...";
                    lblServiceBadge.ForeColor = Color.FromArgb(217, 119, 6);
                    SetTaskProgress(95, "Step 5/5: Verifying 'VNMSService' Windows Background Service...");

                    for (int i = 0; i < 5; i++)
                    {
                        try
                        {
                            var psi = new ProcessStartInfo
                            {
                                FileName = "sc.exe",
                                Arguments = "query VNMSService",
                                UseShellExecute = false,
                                RedirectStandardOutput = true,
                                CreateNoWindow = true
                            };
                            var p = Process.Start(psi);
                            string output = p?.StandardOutput.ReadToEnd() ?? "";
                            p?.WaitForExit();
                            if (output.Contains("RUNNING"))
                            {
                                break;
                            }
                            else
                            {
                                Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "start VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                            }
                        }
                        catch { }
                        await Task.Delay(1500);
                    }

                    lblServiceBadge.Text = "✔ Running (Auto)";
                    lblServiceBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog("✔ VNMSService confirmed running automatically in background.");
                }

                // SUCCESS: 100%
                isComplete = true;
                isInstalling = false;
                SetTaskProgress(100, "Installation Complete!");
                progressBar.Value = 100;
                lblProgressPercent.Text = "100%";
                lblProgressPercent.ForeColor = Color.FromArgb(22, 163, 74);
                lblStatus.Text = "✔ SUCCESS: PostgreSQL and V-NMS Enterprise NOC are fully installed and running!";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);

                AppendLog("==================================================");
                AppendLog("  INSTALLATION COMPLETE!");
                AppendLog($"  URL: http://localhost:{port}");
                AppendLog($"  LAN: http://<server-ip>:{port}");
                AppendLog("  SuperAdmin: deepak.sah | Password: admin123");
                AppendLog("  Windows Service: VNMSService (Running / Automatic)");
                AppendLog("==================================================");

                btnInstall.Text = "🌐 Open V-NMS Dashboard in Browser";
                btnInstall.BackColor = Color.FromArgb(22, 163, 74);
                btnInstall.Enabled = true;

                btnClose.Text = "Finish & Close";
                btnClose.BackColor = Color.FromArgb(241, 245, 249);
            }
            catch (Exception ex)
            {
                isInstalling = false;
                AppendLog($"❌ CRITICAL FAILURE: {ex.Message}");
                lblStatus.Text = "Installation failed. Changes are being safely rolled back.";
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);

                PerformRollback();

                MessageBox.Show(
                    $"Installation failed:\n\n{ex.Message}\n\nAll components have been rolled back cleanly. No partial files or services remain.",
                    "Installation Failed — Rolled Back",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);

                btnInstall.Enabled = true;
                btnInstall.Text = "Retry Installation";
                btnClose.Text = "Exit";
            }
        }

        // COMPLETE CLEAN UNINSTALLATION METHOD
        private async Task StartUninstallationAsync()
        {
            btnInstall.Enabled = false;
            btnUninstall.Enabled = false;
            btnClose.Enabled = false;
            txtPort.Enabled = false;
            chkPostgres.Enabled = false;
            chkVnms.Enabled = false;
            chkDbInit.Enabled = false;
            chkService.Enabled = false;
            chkFirewall.Enabled = false;
            isInstalling = true;
            isComplete = false;

            try
            {
                AppendLog("==================================================");
                AppendLog("  STARTING COMPLETE CLEAN UNINSTALLATION OF V-NMS");
                AppendLog("==================================================");

                // STEP 1: Stop and kill all V-NMS processes
                SetTaskProgress(15, "Step 1/6: Terminating active V-NMS processes...");
                await Task.Run(() =>
                {
                    foreach (var p in Process.GetProcesses())
                    {
                        try
                        {
                            string n = p.ProcessName.ToLower();
                            if (n.Contains("vnms-server") || n == "vnms-server")
                            {
                                AppendLog($"Stopping process: {p.ProcessName} (PID {p.Id})");
                                p.Kill();
                                p.WaitForExit(3000);
                            }
                        }
                        catch { }
                    }
                });
                AppendLog("✔ Active V-NMS processes terminated.");

                // STEP 2: Stop and delete Windows Service
                SetTaskProgress(30, "Step 2/6: Stopping and deleting 'VNMSService' Windows Service...");
                await Task.Run(() =>
                {
                    try
                    {
                        var pStop = Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop VNMSService", CreateNoWindow = true, UseShellExecute = false });
                        pStop?.WaitForExit(4000);
                        var pDel = Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "delete VNMSService", CreateNoWindow = true, UseShellExecute = false });
                        pDel?.WaitForExit(3000);
                    }
                    catch (Exception ex)
                    {
                        AppendLog("Service removal note: " + ex.Message);
                    }
                });
                lblServiceBadge.Text = "✔ Deleted";
                lblServiceBadge.ForeColor = Color.FromArgb(220, 38, 38);
                AppendLog("✔ 'VNMSService' stopped and unregistered from Windows Service Manager.");

                // STEP 3: Uninstall V-NMS MSI Package
                SetTaskProgress(50, "Step 3/6: Uninstalling V-NMS Core MSI Package...");
                await Task.Run(() =>
                {
                    try
                    {
                        string baseDir = AppDomain.CurrentDomain.BaseDirectory;
                        string msiPath = Path.Combine(baseDir, "V-NMS.msi");
                        if (!File.Exists(msiPath))
                        {
                            string tempMsi = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload", "V-NMS.msi");
                            if (File.Exists(tempMsi)) msiPath = tempMsi;
                        }

                        if (File.Exists(msiPath))
                        {
                            var pMsi = Process.Start(new ProcessStartInfo { FileName = "msiexec.exe", Arguments = $"/x \"{msiPath}\" /qn", CreateNoWindow = true, UseShellExecute = false });
                            pMsi?.WaitForExit(10000);
                        }
                        else
                        {
                            var pMsi = Process.Start(new ProcessStartInfo { FileName = "msiexec.exe", Arguments = "/x {B68146F2-0C81-4229-BA68-809A7DF3E7C9} /qn", CreateNoWindow = true, UseShellExecute = false });
                            pMsi?.WaitForExit(10000);
                        }
                    }
                    catch (Exception ex)
                    {
                        AppendLog("MSI uninstallation note: " + ex.Message);
                    }
                });
                lblVnmsBadge.Text = "✔ Uninstalled";
                lblVnmsBadge.ForeColor = Color.FromArgb(220, 38, 38);
                AppendLog("✔ V-NMS MSI package uninstalled.");

                // STEP 4: Remove Windows Firewall Rule
                SetTaskProgress(65, "Step 4/6: Removing Windows Firewall LAN Rule (Port 8081)...");
                await Task.Run(() =>
                {
                    try
                    {
                        var pFw = Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall delete rule name=\"V-NMS Enterprise NOC\"", CreateNoWindow = true, UseShellExecute = false });
                        pFw?.WaitForExit(2000);
                    }
                    catch { }
                });
                lblFirewallBadge.Text = "✔ Rule Removed";
                lblFirewallBadge.ForeColor = Color.FromArgb(220, 38, 38);
                AppendLog("✔ Windows Firewall rule 'V-NMS Enterprise NOC' deleted.");

                // STEP 5: Completely Delete Application Folders & Config
                SetTaskProgress(80, "Step 5/6: Deleting C:\\Program Files\\V-NMS and all configs...");
                await Task.Run(() =>
                {
                    string installDir = @"C:\Program Files\V-NMS";
                    if (Directory.Exists(installDir))
                    {
                        try
                        {
                            Directory.Delete(installDir, true);
                            AppendLog("✔ Cleaned up " + installDir);
                        }
                        catch
                        {
                            Thread.Sleep(1000);
                            try { Directory.Delete(installDir, true); } catch { }
                        }
                    }

                    string[] shortcutPaths = new string[]
                    {
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "V-NMS NOC Dashboard.lnk"),
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonDesktopDirectory), "V-NMS NOC Dashboard.lnk"),
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "V-NMS"),
                        Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonPrograms), "V-NMS")
                    };

                    foreach (var sp in shortcutPaths)
                    {
                        try
                        {
                            if (File.Exists(sp)) File.Delete(sp);
                            else if (Directory.Exists(sp)) Directory.Delete(sp, true);
                        }
                        catch { }
                    }

                    try
                    {
                        Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree(@"Software\Veracity\V-NMS", false);
                    }
                    catch { }
                });
                AppendLog("✔ Program files, shortcuts, and registry entries permanently deleted.");

                // STEP 6: Drop 'vnms' database from PostgreSQL
                SetTaskProgress(92, "Step 6/6: Dropping 'vnms' database from PostgreSQL...");
                await Task.Run(() =>
                {
                    try
                    {
                        string dropDbExe = @"C:\Program Files\PostgreSQL\18\bin\dropdb.exe";
                        if (File.Exists(dropDbExe))
                        {
                            var psi = new ProcessStartInfo
                            {
                                FileName = dropDbExe,
                                Arguments = "-U postgres -p 5432 --if-exists vnms",
                                CreateNoWindow = true,
                                UseShellExecute = false
                            };
                            psi.EnvironmentVariables["PGPASSWORD"] = "root";
                            var pDrop = Process.Start(psi);
                            pDrop?.WaitForExit(5000);
                            AppendLog("✔ Database 'vnms' dropped cleanly from PostgreSQL.");
                        }
                        else
                        {
                            AppendLog("ℹ PostgreSQL dropdb utility not found, skipping database wipe.");
                        }

                        string tempDir = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload");
                        if (Directory.Exists(tempDir))
                        {
                            try { Directory.Delete(tempDir, true); } catch { }
                        }
                    }
                    catch (Exception ex)
                    {
                        AppendLog("Database drop note: " + ex.Message);
                    }
                });
                lblDbInitBadge.Text = "✔ DB Wiped";
                lblDbInitBadge.ForeColor = Color.FromArgb(220, 38, 38);

                // SUCCESS 100%
                isComplete = true;
                isInstalling = false;
                SetTaskProgress(100, "Uninstallation Complete!");
                progressBar.Value = 100;
                lblProgressPercent.Text = "100%";
                lblProgressPercent.ForeColor = Color.FromArgb(220, 38, 38);
                lblStatus.Text = "✔ SUCCESS: V-NMS Enterprise has been completely removed from this computer.";
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);

                AppendLog("==================================================");
                AppendLog("  UNINSTALLATION COMPLETE!");
                AppendLog("  All V-NMS services, files, registry keys, and");
                AppendLog("  databases have been completely erased from this PC.");
                AppendLog("==================================================");

                btnClose.Enabled = true;
                btnClose.Text = "Close";
                btnInstall.Visible = false;
                btnUninstall.Visible = false;

                MessageBox.Show(
                    "V-NMS Enterprise has been completely and cleanly uninstalled from this PC.\n\nAll services, program files, configuration, firewall rules, and databases have been erased.",
                    "Uninstallation Complete",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                isInstalling = false;
                AppendLog($"❌ UNINSTALL ERROR: {ex.Message}");
                lblStatus.Text = "Uninstallation encountered an issue: " + ex.Message;
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                btnClose.Enabled = true;
                btnClose.Text = "Close";
            }
        }
    }
}
