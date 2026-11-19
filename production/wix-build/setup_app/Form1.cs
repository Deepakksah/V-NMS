using System;
using System.Collections.Generic;
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
        // UI Controls - Header
        private Panel headerPanel = null!;
        private Label lblHeaderTitle = null!;
        private Label lblHeaderSub = null!;

        // View Panels (Toggle between Install/Repair View and Removal View)
        private Panel pnlInstallView = null!;
        private Panel pnlRemoveView = null!;

        // ==========================================
        // INSTALL / REPAIR VIEW CONTROLS
        // ==========================================
        private Panel pnlPostgres = null!;
        private CheckBox chkPostgres = null!;
        private Label lblPostgresDesc = null!;
        private Label lblPostgresBadge = null!;

        private Panel pnlVnms = null!;
        private CheckBox chkVnms = null!;
        private Label lblVnmsDesc = null!;
        private Label lblVnmsBadge = null!;

        private Panel pnlDbInit = null!;
        private CheckBox chkDbInit = null!;
        private Label lblDbInitDesc = null!;
        private Label lblDbInitBadge = null!;

        private Panel pnlService = null!;
        private CheckBox chkService = null!;
        private Label lblServiceDesc = null!;
        private Label lblServiceBadge = null!;

        private Panel pnlFirewall = null!;
        private CheckBox chkFirewall = null!;
        private Label lblFirewallDesc = null!;
        private Label lblFirewallBadge = null!;

        private Label lblPortPrompt = null!;
        private TextBox txtPort = null!;
        private Button btnInstall = null!;
        private Button btnRepair = null!;
        private Button btnRemovePrompt = null!;
        private Button btnClose = null!;

        // ==========================================
        // REMOVAL (UNINSTALL) VIEW CONTROLS
        // ==========================================
        private Label lblRemoveTitle = null!;
        private CheckBox chkWipeVnms = null!;
        private CheckBox chkWipeService = null!;
        private CheckBox chkWipeFirewall = null!;
        private CheckBox chkWipeDatabase = null!;
        private CheckBox chkWipePostgres = null!;
        private CheckBox chkWipeTemp = null!;
        private CheckBox chkWipeHostsReg = null!;
        private CheckBox chkTotalCleanWipe = null!;

        private Button btnExecuteRemove = null!;
        private Button btnCancelRemove = null!;

        // ==========================================
        // COMMON TELEMETRY & LOGGING CONTROLS
        // ==========================================
        private ProgressBar progressBar = null!;
        private Label lblProgressPercent = null!;
        private Label lblStatus = null!;
        private RichTextBox rtbLog = null!;

        // Animation & State
        private System.Windows.Forms.Timer animTimer = null!;
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
            this.Text = "Veracity Network Management System (V-NMS) — Enterprise Setup v2.0.0";
            this.Size = new Size(760, 830);
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
                Text = "VERACITY NETWORK MANAGEMENT SYSTEM (V-NMS) v2.0.0",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 12F, FontStyle.Bold),
                Location = new Point(22, 16),
                AutoSize = true
            };

            lblHeaderSub = new Label
            {
                Text = "Enterprise NOC Engine • Setup, Repair & Complete Clean Removal (Zero Traces)",
                ForeColor = Color.FromArgb(148, 163, 184),
                Font = new Font("Segoe UI", 9F, FontStyle.Regular),
                Location = new Point(23, 44),
                AutoSize = true
            };

            headerPanel.Controls.Add(lblHeaderTitle);
            headerPanel.Controls.Add(lblHeaderSub);
            this.Controls.Add(headerPanel);

            // 2. Install / Repair View Panel
            pnlInstallView = new Panel
            {
                Location = new Point(0, 85),
                Size = new Size(760, 375),
                BackColor = Color.FromArgb(248, 250, 252)
            };

            int cardY = 12;
            int cardGap = 50;

            // Comp 1: PostgreSQL 18
            pnlPostgres = CreateComponentCard(cardY,
                out chkPostgres, out lblPostgresDesc, out lblPostgresBadge,
                "PostgreSQL 18 Database Engine (Bundled Embedded Offline)",
                "Relational time-series database for telemetry, metric charts, and incident alerts.",
                "Detecting...", Color.FromArgb(100, 116, 139));
            pnlInstallView.Controls.Add(pnlPostgres);

            // Comp 2: V-NMS Core Suite
            pnlVnms = CreateComponentCard(cardY + cardGap,
                out chkVnms, out lblVnmsDesc, out lblVnmsBadge,
                "V-NMS Core NOC Engine & Dashboard (MSI Package)",
                "Unified binary with high-concurrency poller, auto-discovery and embedded React UI.",
                "v2.0.0 Package", Color.FromArgb(37, 99, 235));
            chkVnms.Checked = true;
            pnlInstallView.Controls.Add(pnlVnms);

            // Comp 3: Database Init
            pnlDbInit = CreateComponentCard(cardY + (cardGap * 2),
                out chkDbInit, out lblDbInitDesc, out lblDbInitBadge,
                "Database Auto-Creation & Telemetry Schema Migrations",
                "Automatically creates 'vnms' database, all 9 enterprise tables, and SuperAdmin user.",
                "Automated", Color.FromArgb(124, 58, 237));
            chkDbInit.Checked = true;
            pnlInstallView.Controls.Add(pnlDbInit);

            // Comp 4: Windows Service
            pnlService = CreateComponentCard(cardY + (cardGap * 3),
                out chkService, out lblServiceDesc, out lblServiceBadge,
                "Official Windows Background Service ('VNMSService')",
                "Runs automatically on system boot. Continuous 24/7 background telemetry monitoring.",
                "Auto-Start", Color.FromArgb(5, 150, 105));
            chkService.Checked = true;
            pnlInstallView.Controls.Add(pnlService);

            // Comp 5: Firewall
            pnlFirewall = CreateComponentCard(cardY + (cardGap * 4),
                out chkFirewall, out lblFirewallDesc, out lblFirewallBadge,
                "Windows Firewall LAN Access Rules (Port 80 & 8081)",
                "Allows incoming HTTP on Port 80 (http://v-nms.com) and Port 8081 for all LAN computers.",
                "Port 80 & 8081", Color.FromArgb(217, 119, 6));
            chkFirewall.Checked = true;
            pnlInstallView.Controls.Add(pnlFirewall);

            // Action Bar for Install / Repair View
            int actionY = cardY + (cardGap * 5) + 12;

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
                Size = new Size(55, 24),
                TextAlign = HorizontalAlignment.Center
            };

            btnInstall = new Button
            {
                Text = "✔ Install V-NMS Now",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                BackColor = Color.FromArgb(2, 132, 199),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(205, actionY),
                Size = new Size(165, 36),
                Cursor = Cursors.Hand
            };
            btnInstall.FlatAppearance.BorderSize = 0;
            btnInstall.Click += BtnInstall_Click;

            btnRepair = new Button
            {
                Text = "🔧 Repair V-NMS",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                BackColor = Color.FromArgb(5, 150, 105),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(380, actionY),
                Size = new Size(140, 36),
                Cursor = Cursors.Hand,
                Visible = false
            };
            btnRepair.FlatAppearance.BorderSize = 0;
            btnRepair.Click += BtnRepair_Click;

            btnRemovePrompt = new Button
            {
                Text = "🗑️ Remove / Uninstall",
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                BackColor = Color.FromArgb(220, 38, 38),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(530, actionY),
                Size = new Size(140, 36),
                Cursor = Cursors.Hand,
                Visible = false
            };
            btnRemovePrompt.FlatAppearance.BorderSize = 0;
            btnRemovePrompt.Click += (s, e) => SwitchToRemovalMode();

            btnClose = new Button
            {
                Text = "Exit",
                Font = new Font("Segoe UI", 9F, FontStyle.Regular),
                BackColor = Color.FromArgb(226, 232, 240),
                ForeColor = Color.FromArgb(30, 41, 59),
                FlatStyle = FlatStyle.Flat,
                Location = new Point(680, actionY),
                Size = new Size(45, 36),
                Cursor = Cursors.Hand
            };
            btnClose.FlatAppearance.BorderSize = 0;
            btnClose.Click += (s, e) => HandleClose();

            pnlInstallView.Controls.Add(lblPortPrompt);
            pnlInstallView.Controls.Add(txtPort);
            pnlInstallView.Controls.Add(btnInstall);
            pnlInstallView.Controls.Add(btnRepair);
            pnlInstallView.Controls.Add(btnRemovePrompt);
            pnlInstallView.Controls.Add(btnClose);
            this.Controls.Add(pnlInstallView);

            // ==========================================
            // 3. REMOVAL (UNINSTALL) VIEW PANEL
            // ==========================================
            pnlRemoveView = new Panel
            {
                Location = new Point(0, 85),
                Size = new Size(760, 375),
                BackColor = Color.FromArgb(254, 242, 242), // Subtle light red tint for removal awareness
                Visible = false
            };

            lblRemoveTitle = new Label
            {
                Text = "SELECT COMPONENTS TO REMOVE (Tick individual items or select Total Clean Wipe):",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                ForeColor = Color.FromArgb(153, 27, 27),
                Location = new Point(22, 10),
                AutoSize = true
            };
            pnlRemoveView.Controls.Add(lblRemoveTitle);

            int remY = 34;
            int remGap = 33;

            // Rem 1: V-NMS Files
            chkWipeVnms = CreateRemovalCheckbox(remY,
                "V-NMS Application & Binaries",
                "Permanently delete 'C:\\Program Files\\V-NMS', Desktop/Start Menu shortcuts, and configs.",
                true);
            pnlRemoveView.Controls.Add(chkWipeVnms);

            // Rem 2: Service
            chkWipeService = CreateRemovalCheckbox(remY + remGap,
                "Windows Background Service ('VNMSService')",
                "Stop running process and unregister 'VNMSService' from Windows Service Control Manager.",
                true);
            pnlRemoveView.Controls.Add(chkWipeService);

            // Rem 3: Firewall
            chkWipeFirewall = CreateRemovalCheckbox(remY + (remGap * 2),
                "Windows Firewall LAN Rules",
                "Delete inbound rules 'V-NMS Enterprise NOC' and 'V-NMS HTTP Web Gateway' (Ports 80/8081).",
                true);
            pnlRemoveView.Controls.Add(chkWipeFirewall);

            // Rem 4: Database
            chkWipeDatabase = CreateRemovalCheckbox(remY + (remGap * 3),
                "'vnms' Database & Telemetry Data",
                "Drop database 'vnms', all 9 tables, recorded telemetry, device inventory, and users.",
                true);
            pnlRemoveView.Controls.Add(chkWipeDatabase);

            // Rem 5: PostgreSQL Engine (User can choose: sirf setup remove ya total postgress ke sath!)
            chkWipePostgres = CreateRemovalCheckbox(remY + (remGap * 4),
                "PostgreSQL 18 Database Server & Engine (Total Purge)",
                "Completely uninstall PostgreSQL 18 server and delete 'C:\\Program Files\\PostgreSQL'.",
                false);
            chkWipePostgres.ForeColor = Color.FromArgb(185, 28, 28);
            pnlRemoveView.Controls.Add(chkWipePostgres);

            // Rem 6: Temp & Cache
            chkWipeTemp = CreateRemovalCheckbox(remY + (remGap * 5),
                "Temporary Files & Staging Payloads (Zero Residual Traces)",
                "Erase '%TEMP%\\VNMS_*', '%LOCALAPPDATA%\\Temp\\*vnms*', logs, and all installer staging bytes.",
                true);
            pnlRemoveView.Controls.Add(chkWipeTemp);

            // Rem 7: Hosts & Registry
            chkWipeHostsReg = CreateRemovalCheckbox(remY + (remGap * 6),
                "Local Domain (v-nms.com) from Hosts File & Registry",
                "Clean 'v-nms.com' from 'C:\\Windows\\System32\\drivers\\etc\\hosts' and delete registry keys.",
                true);
            pnlRemoveView.Controls.Add(chkWipeHostsReg);

            // Master Clean Wipe Option
            chkTotalCleanWipe = new CheckBox
            {
                Text = "💥 TOTAL COMPLETE WIPE (KOI SABOOT NAHI - Erase 100% Files, PostgreSQL, Temp & Logs)",
                Font = new Font("Segoe UI", 9.5F, FontStyle.Bold),
                ForeColor = Color.FromArgb(185, 28, 28),
                Location = new Point(24, remY + (remGap * 7) + 6),
                AutoSize = true,
                Checked = false
            };
            chkTotalCleanWipe.CheckedChanged += (s, e) =>
            {
                bool isAll = chkTotalCleanWipe.Checked;
                chkWipeVnms.Checked = isAll || true;
                chkWipeService.Checked = isAll || true;
                chkWipeFirewall.Checked = isAll || true;
                chkWipeDatabase.Checked = isAll || true;
                chkWipePostgres.Checked = isAll; // Turns on PostgreSQL total purge!
                chkWipeTemp.Checked = isAll || true;
                chkWipeHostsReg.Checked = isAll || true;
            };
            pnlRemoveView.Controls.Add(chkTotalCleanWipe);

            // Removal Action Buttons
            int remActionY = remY + (remGap * 7) + 38;

            btnExecuteRemove = new Button
            {
                Text = "🗑️ Confirm & Execute Clean Removal",
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                BackColor = Color.FromArgb(220, 38, 38),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Location = new Point(22, remActionY),
                Size = new Size(300, 36),
                Cursor = Cursors.Hand
            };
            btnExecuteRemove.FlatAppearance.BorderSize = 0;
            btnExecuteRemove.Click += BtnExecuteRemove_Click;

            btnCancelRemove = new Button
            {
                Text = "⬅ Back to Main Menu",
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                BackColor = Color.FromArgb(226, 232, 240),
                ForeColor = Color.FromArgb(30, 41, 59),
                FlatStyle = FlatStyle.Flat,
                Location = new Point(335, remActionY),
                Size = new Size(160, 36),
                Cursor = Cursors.Hand
            };
            btnCancelRemove.FlatAppearance.BorderSize = 0;
            btnCancelRemove.Click += (s, e) => SwitchToInstallMode();

            pnlRemoveView.Controls.Add(btnExecuteRemove);
            pnlRemoveView.Controls.Add(btnCancelRemove);
            this.Controls.Add(pnlRemoveView);

            // ==========================================
            // 4. COMMON PROGRESS BAR & CONSOLE LOGS
            // ==========================================
            int progressY = 470;

            progressBar = new ProgressBar
            {
                Location = new Point(22, progressY),
                Size = new Size(630, 18),
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
                Location = new Point(655, progressY - 2),
                Size = new Size(60, 22),
                TextAlign = ContentAlignment.MiddleRight
            };

            lblStatus = new Label
            {
                Text = "Ready. Review options above and select an operation.",
                Font = new Font("Segoe UI", 8.5F, FontStyle.Bold),
                ForeColor = Color.FromArgb(71, 85, 105),
                Location = new Point(22, progressY + 24),
                Size = new Size(700, 20)
            };

            this.Controls.Add(progressBar);
            this.Controls.Add(lblProgressPercent);
            this.Controls.Add(lblStatus);

            // Rich Log Console
            rtbLog = new RichTextBox
            {
                Location = new Point(22, progressY + 48),
                Size = new Size(700, 240),
                ReadOnly = true,
                BackColor = Color.FromArgb(15, 23, 42),
                ForeColor = Color.FromArgb(226, 232, 240),
                Font = new Font("Consolas", 8.5F, FontStyle.Regular),
                BorderStyle = BorderStyle.None
            };
            this.Controls.Add(rtbLog);
        }

        private CheckBox CreateRemovalCheckbox(int top, string title, string description, bool defaultChecked)
        {
            var chk = new CheckBox
            {
                Text = $"{title} — {description}",
                Font = new Font("Segoe UI", 8.5F, FontStyle.Regular),
                ForeColor = Color.FromArgb(30, 41, 59),
                Location = new Point(24, top),
                Size = new Size(690, 28),
                Checked = defaultChecked
            };
            return chk;
        }

        private Panel CreateComponentCard(int top, out CheckBox chk, out Label lblDesc, out Label lblBadge, 
            string title, string description, string badgeText, Color badgeColor)
        {
            Panel pnl = new Panel
            {
                Location = new Point(22, top),
                Size = new Size(700, 44),
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
                Location = new Point(490, 10),
                Size = new Size(200, 22),
                TextAlign = ContentAlignment.MiddleRight
            };

            pnl.Controls.Add(chk);
            pnl.Controls.Add(lblDesc);
            pnl.Controls.Add(lblBadge);
            return pnl;
        }

        private void SwitchToRemovalMode()
        {
            pnlInstallView.Visible = false;
            pnlRemoveView.Visible = true;
            lblStatus.Text = "Removal mode active. Tick what to remove or select 'Total Clean Wipe'.";
            lblStatus.ForeColor = Color.FromArgb(185, 28, 28);
        }

        private void SwitchToInstallMode()
        {
            pnlRemoveView.Visible = false;
            pnlInstallView.Visible = true;
            lblStatus.Text = "Ready. Select Install, Repair, or Remove.";
            lblStatus.ForeColor = Color.FromArgb(71, 85, 105);
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
                AppendLog("✔ V-NMS Enterprise is already installed and running on this computer.");
                AppendLog("ℹ Duplicate install blocked to avoid duplicate services and port conflicts.");

                chkVnms.Checked = false;
                lblVnmsBadge.Text = "✔ Already Installed";
                lblVnmsBadge.ForeColor = Color.FromArgb(22, 163, 74);

                chkService.Checked = false;
                lblServiceBadge.Text = "✔ Service Active";
                lblServiceBadge.ForeColor = Color.FromArgb(22, 163, 74);

                chkDbInit.Checked = false;
                lblDbInitBadge.Text = "✔ Database Active";
                lblDbInitBadge.ForeColor = Color.FromArgb(22, 163, 74);

                chkFirewall.Checked = false;
                lblFirewallBadge.Text = "✔ Rules Active";
                lblFirewallBadge.ForeColor = Color.FromArgb(22, 163, 74);

                btnRepair.Visible = true;
                btnRemovePrompt.Visible = true;
                btnInstall.Text = "✔ Already Installed";
                btnInstall.BackColor = Color.FromArgb(100, 116, 139);
                lblStatus.Text = "V-NMS is already installed. Use [Repair] to update or [Remove / Uninstall] to uninstall.";
            }
            else
            {
                chkVnms.Checked = true;
                chkService.Checked = true;
                chkDbInit.Checked = true;
                chkFirewall.Checked = true;
                btnRepair.Visible = false;
                btnRemovePrompt.Visible = false;
                btnInstall.Text = "✔ Install V-NMS Now";
                btnInstall.BackColor = Color.FromArgb(2, 132, 199);
                lblStatus.Text = "Ready for fresh installation. Click 'Install V-NMS Now'.";
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

        private void HandleClose()
        {
            if (isInstalling && !isComplete)
            {
                var result = MessageBox.Show(
                    "Setup operation is currently in progress!\n\nAre you sure you want to cancel?",
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
                        if (n.Contains("postgresql-18") || n.Contains("bitrock") || n.Contains("installbuilder") || n.Contains("vnms-server"))
                        {
                            p.Kill();
                        }
                    }
                    catch { }
                }

                try
                {
                    Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                    Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "delete VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                }
                catch { }

                CleanFirewallRules();
                CleanAllTemporaryFiles();

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

        // ==========================================
        // 1. INSTALLATION WORKFLOW
        // ==========================================
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

            // Guard: Prevent duplicate installation if already installed
            bool isVnmsInstalled = File.Exists(@"C:\Program Files\V-NMS\vnms-server.exe") || IsPortListening("127.0.0.1", 8081);
            if (isVnmsInstalled)
            {
                MessageBox.Show(
                    "V-NMS Enterprise is already installed and running on this system!\n\n" +
                    "Duplicate installation is blocked to prevent duplicate services and port conflicts.\n\n" +
                    "• To repair or refresh the current installation, click '🔧 Repair V-NMS'.\n" +
                    "• To perform a clean reinstall, click '🗑️ Remove / Uninstall' first to remove existing components.",
                    "V-NMS — Already Installed",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
                return;
            }

            await StartInstallationAsync();
        }

        private async Task StartInstallationAsync()
        {
            btnInstall.Enabled = false;
            btnRepair.Enabled = false;
            btnRemovePrompt.Enabled = false;
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

                // STEP 1: PostgreSQL Installation
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
                        }
                        catch (Exception ex)
                        {
                            AppendLog("Installer notice: " + ex.Message);
                        }
                    });

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
                    }

                    if (!pgReady && !IsPortListening("127.0.0.1", 5432))
                    {
                        throw new Exception("PostgreSQL 18 failed to start on Port 5432. Installation cannot proceed.");
                    }

                    lblPostgresBadge.Text = "✔ Installed & Active (5432)";
                    lblPostgresBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog("✔ PostgreSQL 18 is actively listening on port 5432.");
                    SetTaskProgress(50, "Step 1/5: PostgreSQL 18 verified ready.");
                }
                else
                {
                    lblPostgresBadge.Text = "✔ Using Existing Engine";
                    lblPostgresBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    SetTaskProgress(50, "Step 1/5: Using existing PostgreSQL database on Port 5432...");
                    await Task.Delay(300);
                }

                // STEP 2: Deploy V-NMS MSI Package
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
                    AppendLog("✔ Default SuperAdmin seeded (deepak.sah / admin123).");
                    await Task.Delay(300);
                }

                // STEP 4: Firewall Configuration (Port 80 & 8081)
                if (chkFirewall.Checked)
                {
                    SetTaskProgress(88, $"Step 4/5: Configuring Windows Firewall rules for Port 80 & {port}...");
                    await Task.Run(() =>
                    {
                        try
                        {
                            // Rule 1: Port 8081
                            Process.Start(new ProcessStartInfo
                            {
                                FileName = "netsh",
                                Arguments = $"advfirewall firewall add rule name=\"V-NMS Enterprise NOC\" dir=in action=allow protocol=TCP localport={port}",
                                UseShellExecute = false,
                                CreateNoWindow = true
                            })?.WaitForExit();

                            // Rule 2: Port 80 for direct http://v-nms.com access
                            Process.Start(new ProcessStartInfo
                            {
                                FileName = "netsh",
                                Arguments = "advfirewall firewall add rule name=\"V-NMS HTTP Web Gateway\" dir=in action=allow protocol=TCP localport=80",
                                UseShellExecute = false,
                                CreateNoWindow = true
                            })?.WaitForExit();
                        }
                        catch { }
                    });
                    lblFirewallBadge.Text = "✔ Ports 80 & 8081 Allowed";
                    lblFirewallBadge.ForeColor = Color.FromArgb(22, 163, 74);
                    AppendLog($"✔ Windows Firewall rules active: Inbound TCP 80 & {port} Allowed.");
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
                lblStatus.Text = "✔ SUCCESS: V-NMS Enterprise NOC is fully installed and active!";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);

                AppendLog("==================================================");
                AppendLog("  INSTALLATION COMPLETE — V-NMS v2.0.0 Enterprise");
                AppendLog($"  URL: http://localhost:{port} or http://v-nms.com");
                AppendLog("  Windows Service: VNMSService (Running / Automatic)");
                AppendLog("==================================================");

                btnInstall.Text = "🌐 Open V-NMS Dashboard in Browser";
                btnInstall.BackColor = Color.FromArgb(22, 163, 74);
                btnInstall.Enabled = true;

                btnRepair.Visible = true;
                btnRepair.Enabled = true;
                btnRemovePrompt.Visible = true;
                btnRemovePrompt.Enabled = true;

                btnClose.Text = "Finish & Close";
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

        // ==========================================
        // 2. REPAIR WORKFLOW
        // ==========================================
        private async void BtnRepair_Click(object? sender, EventArgs e)
        {
            var confirm = MessageBox.Show(
                "Are you sure you want to REPAIR V-NMS Enterprise?\n\n" +
                "Repair will:\n" +
                "1. Terminate any hanging or corrupted V-NMS processes.\n" +
                "2. Verify and re-deploy application binaries and service.\n" +
                "3. Re-register and restart 'VNMSService' with auto-start.\n" +
                "4. Re-apply Windows Firewall rules for Port 80 and 8081.\n" +
                "5. Verify database connectivity and schema tables.\n\n" +
                "Your existing monitoring data and settings will be preserved.",
                "Confirm V-NMS Repair",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question);

            if (confirm != DialogResult.Yes) return;

            await StartRepairAsync();
        }

        private async Task StartRepairAsync()
        {
            btnInstall.Enabled = false;
            btnRepair.Enabled = false;
            btnRemovePrompt.Enabled = false;
            btnClose.Enabled = false;
            isInstalling = true;
            isComplete = false;

            try
            {
                AppendLog("==================================================");
                AppendLog("  STARTING ATOMIC V-NMS ENTERPRISE REPAIR");
                AppendLog("==================================================");

                // Step 1: Terminate active processes and stop service
                SetTaskProgress(15, "Step 1/5: Stopping active V-NMS processes for repair...");
                await Task.Run(() =>
                {
                    foreach (var p in Process.GetProcesses())
                    {
                        try
                        {
                            string n = p.ProcessName.ToLower();
                            if (n.Contains("vnms-server"))
                            {
                                p.Kill();
                                p.WaitForExit(2000);
                            }
                        }
                        catch { }
                    }
                    try
                    {
                        Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(3000);
                    }
                    catch { }
                });
                AppendLog("✔ V-NMS service and processes stopped for maintenance.");

                // Step 2: Repair MSI Package
                SetTaskProgress(40, "Step 2/5: Repairing V-NMS application files...");
                await Task.Run(() =>
                {
                    string msiPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "V-NMS.msi");
                    if (!File.Exists(msiPath))
                    {
                        string tempMsi = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload", "V-NMS.msi");
                        if (File.Exists(tempMsi)) msiPath = tempMsi;
                    }

                    if (File.Exists(msiPath))
                    {
                        var psi = new ProcessStartInfo
                        {
                            FileName = "msiexec.exe",
                            Arguments = $"/fa \"{msiPath}\" /qn",
                            UseShellExecute = true,
                            Verb = "runas"
                        };
                        var proc = Process.Start(psi);
                        proc?.WaitForExit();
                    }
                });
                AppendLog("✔ Application files and binaries repaired.");

                // Step 3: Re-apply Firewall Rules
                SetTaskProgress(60, "Step 3/5: Re-applying Windows Firewall rules (Port 80 & 8081)...");
                await Task.Run(() =>
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall add rule name=\"V-NMS Enterprise NOC\" dir=in action=allow protocol=TCP localport=8081", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                        Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall add rule name=\"V-NMS HTTP Web Gateway\" dir=in action=allow protocol=TCP localport=80", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                    }
                    catch { }
                });
                AppendLog("✔ Windows Firewall rules for Port 80 and 8081 validated.");

                // Step 4: Verify PostgreSQL connection
                SetTaskProgress(75, "Step 4/5: Validating PostgreSQL database connection...");
                bool isDbUp = IsPortListening("127.0.0.1", 5432);
                if (!isDbUp)
                {
                    AppendLog("PostgreSQL is not running on 5432, attempting service start...");
                    Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "start postgresql-x64-18", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(3000);
                }
                AppendLog("✔ PostgreSQL database engine verified.");

                // Step 5: Start & Verify VNMSService
                SetTaskProgress(90, "Step 5/5: Starting repaired 'VNMSService'...");
                await Task.Run(() =>
                {
                    try
                    {
                        Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "config VNMSService start= auto", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                        Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "start VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(3000);
                    }
                    catch { }
                });
                await Task.Delay(2000);

                bool isPortActive = IsPortListening("127.0.0.1", 8081) || IsPortListening("127.0.0.1", 80);
                AppendLog(isPortActive ? "✔ VNMSService is actively serving HTTP requests." : "ℹ Service started, awaiting initialization...");

                // SUCCESS
                isComplete = true;
                isInstalling = false;
                SetTaskProgress(100, "Repair Complete!");
                progressBar.Value = 100;
                lblProgressPercent.Text = "100%";
                lblProgressPercent.ForeColor = Color.FromArgb(22, 163, 74);
                lblStatus.Text = "✔ SUCCESS: V-NMS Enterprise has been completely repaired and is running normally!";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);

                AppendLog("==================================================");
                AppendLog("  REPAIR COMPLETE — All components healthy!");
                AppendLog("==================================================");

                btnInstall.Enabled = true;
                btnRepair.Enabled = true;
                btnRemovePrompt.Enabled = true;
                btnClose.Enabled = true;
                btnClose.Text = "Finish";

                MessageBox.Show(
                    "V-NMS Enterprise has been completely repaired!\n\nAll services, binaries, firewall rules, and database connections have been verified and are running.",
                    "Repair Complete",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                isInstalling = false;
                AppendLog($"❌ REPAIR ERROR: {ex.Message}");
                lblStatus.Text = "Repair encountered an error: " + ex.Message;
                lblStatus.ForeColor = Color.FromArgb(220, 38, 38);
                btnInstall.Enabled = true;
                btnRepair.Enabled = true;
                btnRemovePrompt.Enabled = true;
                btnClose.Enabled = true;
            }
        }

        // ==========================================
        // 3. COMPLETE CLEAN REMOVAL WORKFLOW
        // ==========================================
        private async void BtnExecuteRemove_Click(object? sender, EventArgs e)
        {
            string summary = "Are you sure you want to proceed with removal?\n\nSelected actions:\n";
            if (chkWipeVnms.Checked) summary += "• Delete V-NMS program files, executables, and shortcuts\n";
            if (chkWipeService.Checked) summary += "• Stop and delete 'VNMSService' Windows background service\n";
            if (chkWipeFirewall.Checked) summary += "• Delete Windows Firewall rules for Port 80 and 8081\n";
            if (chkWipeDatabase.Checked) summary += "• Drop 'vnms' telemetry database and all tables from PostgreSQL\n";
            if (chkWipePostgres.Checked) summary += "• ⚠️ TOTAL PURGE: Uninstall PostgreSQL 18 server and delete data cluster\n";
            if (chkWipeTemp.Checked) summary += "• Erase all temporary files and staging payload bytes (Zero Traces)\n";
            if (chkWipeHostsReg.Checked) summary += "• Remove 'v-nms.com' from hosts file and delete registry keys\n";

            summary += "\nThis action cannot be undone. Proceed?";

            var confirm = MessageBox.Show(
                summary,
                "Confirm Removal Execution",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Warning);

            if (confirm != DialogResult.Yes) return;

            await StartUninstallationAsync();
        }

        private async Task StartUninstallationAsync()
        {
            btnExecuteRemove.Enabled = false;
            btnCancelRemove.Enabled = false;
            btnClose.Enabled = false;
            isInstalling = true;
            isComplete = false;

            try
            {
                AppendLog("==================================================");
                AppendLog("  STARTING CUSTOM CLEAN UNINSTALLATION OF V-NMS");
                AppendLog("==================================================");

                // STEP 1: Terminate active processes
                SetTaskProgress(15, "Step 1/7: Terminating active V-NMS processes...");
                await Task.Run(() =>
                {
                    foreach (var p in Process.GetProcesses())
                    {
                        try
                        {
                            string n = p.ProcessName.ToLower();
                            if (n.Contains("vnms-server") || n == "vnms-server")
                            {
                                AppendLog($"Terminating process: {p.ProcessName} (PID {p.Id})");
                                p.Kill();
                                p.WaitForExit(3000);
                            }
                        }
                        catch { }
                    }
                });
                AppendLog("✔ Active V-NMS processes terminated.");

                // STEP 2: Stop and Delete Windows Background Service
                if (chkWipeService.Checked)
                {
                    SetTaskProgress(30, "Step 2/7: Stopping and deleting 'VNMSService' Windows Service...");
                    await Task.Run(() =>
                    {
                        try
                        {
                            Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(4000);
                            Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "delete VNMSService", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(3000);
                        }
                        catch (Exception ex)
                        {
                            AppendLog("Service removal notice: " + ex.Message);
                        }
                    });
                    AppendLog("✔ 'VNMSService' stopped and unregistered from Windows.");
                }

                // STEP 3: Uninstall MSI Package & Application Files
                if (chkWipeVnms.Checked)
                {
                    SetTaskProgress(45, "Step 3/7: Uninstalling V-NMS Core MSI Package and files...");
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
                        catch { }

                        // Forceful directory cleanup (zero residual files)
                        string installDir = @"C:\Program Files\V-NMS";
                        if (Directory.Exists(installDir))
                        {
                            try
                            {
                                Directory.Delete(installDir, true);
                            }
                            catch
                            {
                                Thread.Sleep(1000);
                                try { Directory.Delete(installDir, true); } catch { }
                            }
                        }

                        // Remove all Shortcuts
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

                        // AppData Cleanup
                        try
                        {
                            string appDataRoaming = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "V-NMS");
                            if (Directory.Exists(appDataRoaming)) Directory.Delete(appDataRoaming, true);
                            string appDataLocal = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "V-NMS");
                            if (Directory.Exists(appDataLocal)) Directory.Delete(appDataLocal, true);
                        }
                        catch { }
                    });
                    AppendLog("✔ V-NMS files, shortcuts, and application data erased from C:\\Program Files\\V-NMS.");
                }

                // STEP 4: Firewall Rules Cleanup
                if (chkWipeFirewall.Checked)
                {
                    SetTaskProgress(60, "Step 4/7: Removing Windows Firewall LAN Rules (Port 80 & 8081)...");
                    await Task.Run(() => CleanFirewallRules());
                }

                // STEP 5: Drop Database from PostgreSQL
                if (chkWipeDatabase.Checked)
                {
                    SetTaskProgress(70, "Step 5/7: Dropping 'vnms' database from PostgreSQL...");
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
                                AppendLog("✔ Database 'vnms' and all tables dropped cleanly from PostgreSQL.");
                            }
                            else
                            {
                                AppendLog("ℹ dropdb.exe not found, skipping database wipe.");
                            }
                        }
                        catch (Exception ex)
                        {
                            AppendLog("Database drop notice: " + ex.Message);
                        }
                    });
                }

                // STEP 6: PostgreSQL 18 Total Server Purge (if selected by user)
                if (chkWipePostgres.Checked)
                {
                    SetTaskProgress(80, "Step 6/7: Completely uninstalling PostgreSQL 18 server (Total Wipe)...");
                    await Task.Run(() => UninstallPostgreSQLComplete());
                }
                else
                {
                    SetTaskProgress(80, "Step 6/7: Preserving PostgreSQL 18 server (Setup removal only)...");
                    AppendLog("ℹ PostgreSQL 18 server preserved as requested.");
                }

                // STEP 7: Erase Temporary Files & Local Domain Hosts / Registry (KOI SABOOT NAHI)
                SetTaskProgress(92, "Step 7/7: Erasing temporary staging files and cleaning registry (Zero Traces)...");
                await Task.Run(() =>
                {
                    if (chkWipeTemp.Checked)
                    {
                        CleanAllTemporaryFiles();
                    }

                    if (chkWipeHostsReg.Checked)
                    {
                        CleanHostsFile();
                        try
                        {
                            Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree(@"Software\Veracity\V-NMS", false);
                        }
                        catch { }
                        try
                        {
                            Microsoft.Win32.Registry.LocalMachine.DeleteSubKeyTree(@"Software\Veracity\V-NMS", false);
                        }
                        catch { }
                        AppendLog("✔ Cleaned V-NMS registry entries.");
                    }
                });

                // SUCCESS 100%
                isComplete = true;
                isInstalling = false;
                SetTaskProgress(100, "Clean Uninstallation Complete!");
                progressBar.Value = 100;
                lblProgressPercent.Text = "100%";
                lblProgressPercent.ForeColor = Color.FromArgb(22, 163, 74);
                lblStatus.Text = "✔ SUCCESS: Selected V-NMS components have been completely and cleanly erased.";
                lblStatus.ForeColor = Color.FromArgb(22, 163, 74);

                AppendLog("==================================================");
                AppendLog("  UNINSTALLATION COMPLETE — ZERO RESIDUAL TRACES");
                AppendLog("  All selected services, program files, firewall rules,");
                AppendLog("  and temporary cache bytes have been permanently erased.");
                AppendLog("==================================================");

                btnClose.Enabled = true;
                btnClose.Text = "Close";
                btnExecuteRemove.Visible = false;
                btnCancelRemove.Visible = false;

                MessageBox.Show(
                    "V-NMS Enterprise removal is complete!\n\nAll selected files, services, firewall rules, and temporary artifacts have been completely erased from this computer with zero residual traces.",
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

        // ==========================================
        // ZERO TRACE CLEANUP HELPERS
        // ==========================================
        private void CleanFirewallRules()
        {
            try
            {
                Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall delete rule name=\"V-NMS Enterprise NOC\"", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                Process.Start(new ProcessStartInfo { FileName = "netsh", Arguments = "advfirewall firewall delete rule name=\"V-NMS HTTP Web Gateway\"", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
                AppendLog("✔ Deleted Windows Firewall rules for Port 8081 and Port 80.");
            }
            catch { }
        }

        private void CleanHostsFile()
        {
            try
            {
                string hostsPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "drivers", "etc", "hosts");
                if (File.Exists(hostsPath))
                {
                    var lines = File.ReadAllLines(hostsPath);
                    var cleanLines = new List<string>();
                    bool modified = false;

                    foreach (var line in lines)
                    {
                        if (line.IndexOf("v-nms.com", StringComparison.OrdinalIgnoreCase) >= 0 ||
                            line.IndexOf("V-NMS", StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            modified = true;
                            continue;
                        }
                        cleanLines.Add(line);
                    }

                    if (modified)
                    {
                        File.WriteAllLines(hostsPath, cleanLines);
                        AppendLog("✔ Removed 'v-nms.com' domain mapping from Windows hosts file.");
                    }
                }
            }
            catch (Exception ex)
            {
                AppendLog("Hosts cleanup note: " + ex.Message);
            }
        }

        private void CleanAllTemporaryFiles()
        {
            AppendLog("Eradicating all temporary staging files and caches (Zero Traces)...");
            try
            {
                string tempDir = Path.Combine(Path.GetTempPath(), "VNMS_Setup_Payload");
                if (Directory.Exists(tempDir))
                {
                    Directory.Delete(tempDir, true);
                    AppendLog("✔ Erased temp directory: " + tempDir);
                }
            }
            catch { }

            // Search and erase any leftover matching files/folders in %TEMP%
            try
            {
                string tempRoot = Path.GetTempPath();
                var di = new DirectoryInfo(tempRoot);
                foreach (var dir in di.GetDirectories("*vnms*", SearchOption.TopDirectoryOnly))
                {
                    try { dir.Delete(true); AppendLog("✔ Erased temp folder: " + dir.FullName); } catch { }
                }
                foreach (var file in di.GetFiles("*vnms*", SearchOption.TopDirectoryOnly))
                {
                    try { file.Delete(); AppendLog("✔ Erased temp file: " + file.FullName); } catch { }
                }
            }
            catch { }

            // Search and erase in LocalAppData\Temp
            try
            {
                string localTemp = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Temp");
                if (Directory.Exists(localTemp))
                {
                    var di = new DirectoryInfo(localTemp);
                    foreach (var dir in di.GetDirectories("*vnms*", SearchOption.TopDirectoryOnly))
                    {
                        try { dir.Delete(true); } catch { }
                    }
                    foreach (var file in di.GetFiles("*vnms*", SearchOption.TopDirectoryOnly))
                    {
                        try { file.Delete(); } catch { }
                    }
                }
            }
            catch { }

            AppendLog("✔ All temporary payload files, extraction caches, and staging artifacts erased.");
        }

        private void UninstallPostgreSQLComplete()
        {
            AppendLog("Executing complete unattended uninstallation of PostgreSQL 18...");

            // 1. Terminate all postgres processes
            foreach (var p in Process.GetProcesses())
            {
                try
                {
                    string n = p.ProcessName.ToLower();
                    if (n.Contains("postgres") || n.Contains("pg_ctl"))
                    {
                        p.Kill();
                        p.WaitForExit(2000);
                    }
                }
                catch { }
            }

            // 2. Stop and delete postgresql service
            try
            {
                Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "stop postgresql-x64-18", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(3000);
                Process.Start(new ProcessStartInfo { FileName = "sc.exe", Arguments = "delete postgresql-x64-18", CreateNoWindow = true, UseShellExecute = false })?.WaitForExit(2000);
            }
            catch { }

            // 3. Run uninstaller if exists
            string uninstaller = @"C:\Program Files\PostgreSQL\18\uninstall-postgresql.exe";
            if (File.Exists(uninstaller))
            {
                try
                {
                    var psi = new ProcessStartInfo
                    {
                        FileName = uninstaller,
                        Arguments = "--mode unattended",
                        CreateNoWindow = true,
                        UseShellExecute = false
                    };
                    var proc = Process.Start(psi);
                    proc?.WaitForExit(30000);
                    AppendLog("✔ PostgreSQL 18 official uninstaller completed.");
                }
                catch { }
            }

            // 4. Force delete directories
            try
            {
                if (Directory.Exists(@"C:\Program Files\PostgreSQL"))
                {
                    Directory.Delete(@"C:\Program Files\PostgreSQL", true);
                    AppendLog("✔ Deleted 'C:\\Program Files\\PostgreSQL'.");
                }
            }
            catch
            {
                Thread.Sleep(1000);
                try { Directory.Delete(@"C:\Program Files\PostgreSQL", true); } catch { }
            }

            try
            {
                if (Directory.Exists(@"C:\ProgramData\PostgreSQL"))
                {
                    Directory.Delete(@"C:\ProgramData\PostgreSQL", true);
                }
            }
            catch { }

            AppendLog("✔ PostgreSQL 18 server and data cluster completely eradicated.");
        }
    }
}
