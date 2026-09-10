Add-Type -AssemblyName System.Drawing

$width = 1024
$height = 500

$bmp = New-Object System.Drawing.Bitmap($width, $height)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# Helper for rounded rectangles
function DrawRoundedCard($graphics, $brush, $x, $y, $w, $h, $radius) {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = $radius * 2
    $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
    $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
    $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $graphics.FillPath($brush, $path)
    return $path
}

# 1. Background Gradient (Deep rich dark neo background)
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(20, 22, 28),
    [System.Drawing.Color]::FromArgb(12, 13, 16),
    [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
)
$g.FillRectangle($brush, $rect)

# 2. Sleek Orange Glow Accents
$glowBrush1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 255, 94, 26))
$g.FillEllipse($glowBrush1, -80, -60, 420, 420)

$glowBrush2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 255, 94, 26))
$g.FillEllipse($glowBrush2, 700, 180, 400, 400)

# 3. Draw App Icon on the left side
$iconPath = "d:\Antigravity projects in D drive\omni-todo-notes\play_store_assets\app_icon_512x512.png"
if (Test-Path $iconPath) {
    $iconImg = [System.Drawing.Image]::FromFile($iconPath)
    
    # Rounded backdrop shadow for icon
    $iconBackdrop = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(40, 255, 255, 255))
    $null = DrawRoundedCard $g $iconBackdrop 58 58 94 94 20
    
    $g.DrawImage($iconImg, 60, 60, 90, 90)
    $iconImg.Dispose()
}

# 4. Main App Title & Tagline
$titleFont = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(248, 250, 252))
$g.DrawString("My Notes", $titleFont, $titleBrush, 168, 62)

$taglineFont = New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)
$accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 94, 26))
$g.DrawString("DAILY PLANNER & ORGANIZER", $taglineFont, $accentBrush, 172, 118)

# 5. Feature Badges on the Left
$badgeFont = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$subTextBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 230, 240))

$pills = @(
    "100% Offline & Private",
    "Todo Time Horizons (Today to Year)",
    "Personal Cash Flow & Lending Ledger",
    "Visual Mind Maps & Smart Shopping"
)

$py = 180
foreach ($pill in $pills) {
    # Pill card background
    $pillBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(30, 34, 44))
    $null = DrawRoundedCard $g $pillBg 60 $py 395 52 14
    
    # Border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(48, 54, 70), 1)
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = 28
    $path.AddArc(60, $py, $diameter, $diameter, 180, 90)
    $path.AddArc(60 + 395 - $diameter, $py, $diameter, $diameter, 270, 90)
    $path.AddArc(60 + 395 - $diameter, $py + 52 - $diameter, $diameter, $diameter, 0, 90)
    $path.AddArc(60, $py + 52 - $diameter, $diameter, $diameter, 90, 90)
    $path.CloseFigure()
    $g.DrawPath($borderPen, $path)

    # Orange Accent Indicator
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 94, 26))
    $g.FillEllipse($dotBrush, 80, $py + 21, 10, 10)
    
    # Label
    $g.DrawString($pill, $badgeFont, $subTextBrush, 102, $py + 15)
    $py += 68
}

# 6. Right Side: 2 Phone Mockups with Clean App Screenshots (status bar cropped)
$screen1Path = "d:\Antigravity projects in D drive\omni-todo-notes\play_store_assets\screenshot_1_home.png"
$screen2Path = "d:\Antigravity projects in D drive\omni-todo-notes\play_store_assets\screenshot_2_todo.png"

if ((Test-Path $screen1Path) -and (Test-Path $screen2Path)) {
    $s1 = [System.Drawing.Image]::FromFile($screen1Path)
    $s2 = [System.Drawing.Image]::FromFile($screen2Path)
    
    # Source crop: skip Android top status bar (top 170px) and bottom navigation (bottom 100px)
    $srcCropX = 0
    $srcCropY = 170
    $srcCropW = $s1.Width
    $srcCropH = $s1.Height - 270
    $srcRect = New-Object System.Drawing.Rectangle($srcCropX, $srcCropY, $srcCropW, $srcCropH)

    $phoneW = 225
    $phoneH = 460
    
    # PHONE 2 (Todo List) - Background layer
    $p2X = 760
    $p2Y = 30
    $p2Shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
    $null = DrawRoundedCard $g $p2Shadow ($p2X + 8) ($p2Y + 12) $phoneW $phoneH 24
    
    $p2FrameBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(28, 30, 38))
    $null = DrawRoundedCard $g $p2FrameBg $p2X $p2Y $phoneW $phoneH 24
    
    # Inner clipped screenshot
    $destRect2 = New-Object System.Drawing.Rectangle(($p2X + 6), ($p2Y + 6), ($phoneW - 12), ($phoneH - 12))
    $g.DrawImage($s2, $destRect2, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    $framePen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(65, 70, 85), 2)
    $null = DrawRoundedCard $g $p2FrameBg $p2X $p2Y $phoneW $phoneH 24
    $g.DrawImage($s2, $destRect2, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    
    # PHONE 1 (Home Screen) - Foreground layer
    $p1X = 505
    $p1Y = 55
    $p1Shadow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 0, 0, 0))
    $null = DrawRoundedCard $g $p1Shadow ($p1X + 10) ($p1Y + 15) $phoneW $phoneH 24
    
    $p1FrameBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(32, 34, 44))
    $null = DrawRoundedCard $g $p1FrameBg $p1X $p1Y $phoneW $phoneH 24
    
    $destRect1 = New-Object System.Drawing.Rectangle(($p1X + 6), ($p1Y + 6), ($phoneW - 12), ($phoneH - 12))
    $g.DrawImage($s1, $destRect1, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

    # Frame highlight borders
    $framePen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 94, 26, 120), 2)
    $path1 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $diameter = 44
    $path1.AddArc($p1X, $p1Y, $diameter, $diameter, 180, 90)
    $path1.AddArc($p1X + $phoneW - $diameter, $p1Y, $diameter, $diameter, 270, 90)
    $path1.AddArc($p1X + $phoneW - $diameter, $p1Y + $phoneH - $diameter, $diameter, $diameter, 0, 90)
    $path1.AddArc($p1X, $p1Y + $phoneH - $diameter, $diameter, $diameter, 90, 90)
    $path1.CloseFigure()
    $g.DrawPath($framePen1, $path1)

    $s1.Dispose()
    $s2.Dispose()
}

# Save finalized graphic
$outPath = "d:\Antigravity projects in D drive\omni-todo-notes\play_store_assets\feature_graphic_1024x500.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Output "Successfully updated: $outPath ($width x $height)"
