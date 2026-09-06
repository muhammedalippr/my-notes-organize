Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\91989\Downloads\file_000000007c148211942b752b55fd61da.png"
$srcImg = [System.Drawing.Image]::FromFile($srcPath)

function Resize-And-Save($img, $width, $height, $destPath, $makeCircle) {
    $bmp = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    if ($makeCircle) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $width, $height)
        $graphics.SetClip($path)
    }

    $graphics.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
}

function Create-Adaptive-Foreground($img, $size, $destPath) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)

    $innerSize = [int]($size * 0.78)
    $offset = [int](($size - $innerSize) / 2)

    $graphics.DrawImage($img, $offset, $offset, $innerSize, $innerSize)
    $bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
}

$densities = @(
    @{ folder = "mipmap-mdpi"; legacy = 48; foreground = 108 },
    @{ folder = "mipmap-hdpi"; legacy = 72; foreground = 162 },
    @{ folder = "mipmap-xhdpi"; legacy = 96; foreground = 216 },
    @{ folder = "mipmap-xxhdpi"; legacy = 144; foreground = 324 },
    @{ folder = "mipmap-xxxhdpi"; legacy = 192; foreground = 432 }
)

$baseRes = "android/app/src/main/res"

foreach ($entry in $densities) {
    $folderPath = Join-Path $baseRes $entry.folder
    $legacySize = $entry.legacy
    $fgSize = $entry.foreground

    Resize-And-Save $srcImg $legacySize $legacySize (Join-Path $folderPath "ic_launcher.png") $false
    Resize-And-Save $srcImg $legacySize $legacySize (Join-Path $folderPath "ic_launcher_round.png") $true
    Create-Adaptive-Foreground $srcImg $fgSize (Join-Path $folderPath "ic_launcher_foreground.png")
    
    Write-Host "Generated icons for $($entry.folder)"
}

Resize-And-Save $srcImg 512 512 "public/icon-512.png" $false
Resize-And-Save $srcImg 192 192 "public/favicon.png" $false

$srcImg.Dispose()
Write-Host "All launcher icons generated successfully!"
