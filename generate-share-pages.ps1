$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$photoJsPath = Join-Path $projectRoot "photo.js"
$shareRoot = Join-Path $projectRoot "share"
$shareImageRoot = Join-Path $projectRoot "share-images"


function New-SocialPreview {

    param (
        [string]$SourcePath,
        [string]$OutputPath
    )

    $canvasWidth = 1200
    $canvasHeight = 630

    $sourceImage = [System.Drawing.Image]::FromFile($SourcePath)

    try {

        $canvas = New-Object System.Drawing.Bitmap(
            $canvasWidth,
            $canvasHeight
        )

        $graphics = [System.Drawing.Graphics]::FromImage($canvas)

        try {

            $graphics.Clear([System.Drawing.Color]::Black)

            $scaleX = $canvasWidth / $sourceImage.Width
            $scaleY = $canvasHeight / $sourceImage.Height

            $scale = [Math]::Min($scaleX, $scaleY)

            $newWidth = [int]($sourceImage.Width * $scale)
            $newHeight = [int]($sourceImage.Height * $scale)

            $x = [int](($canvasWidth - $newWidth) / 2)
            $y = [int](($canvasHeight - $newHeight) / 2)

            $graphics.InterpolationMode =
                [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

            $graphics.SmoothingMode =
                [System.Drawing.Drawing2D.SmoothingMode]::HighQuality

            $graphics.PixelOffsetMode =
                [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

            $graphics.DrawImage(
                $sourceImage,
                $x,
                $y,
                $newWidth,
                $newHeight
            )

            $canvas.Save(
                $OutputPath,
                [System.Drawing.Imaging.ImageFormat]::Jpeg
            )

        }
        finally {
            $graphics.Dispose()
        }

    }
    finally {
        $sourceImage.Dispose()

        if ($canvas) {
            $canvas.Dispose()
        }
    }
}

Write-Host ""
Write-Host "Generating social share pages..."
Write-Host ""

$photoJs = Get-Content $photoJsPath -Raw

$projectMatches = [regex]::Matches(
    $photoJs,
    '(?s)"([^"]+)"\s*:\s*\{.*?title:\s*"([^"]+)".*?folder:\s*"([^"]+)".*?photos:\s*\[(.*?)\]'
)

$totalPages = 0
$totalProjects = 0

foreach ($match in $projectMatches) {

    $projectKey = $match.Groups[1].Value
    $projectTitle = $match.Groups[2].Value
    $folder = $match.Groups[3].Value
    $photosBlock = $match.Groups[4].Value

    # Support both:
#   "001.jpg"
# and:
#   { src: "001.jpg", caption: "Linz, Austria | 2025" }

$photoMatches = [regex]::Matches(
    $photosBlock,
    '(?m)^\s*"([^"]+)"\s*,?\s*$|\{\s*src:\s*"([^"]+)"'
)

if ($photoMatches.Count -eq 0) {
    continue
}

    

    

    $totalProjects++

    Write-Host "$projectTitle : $($photoMatches.Count) photos"

    for ($i = 0; $i -lt $photoMatches.Count; $i++) {

        $photoNumber = $i + 1
$photoFile = if ($photoMatches[$i].Groups[1].Success) {
    $photoMatches[$i].Groups[1].Value
} else {
    $photoMatches[$i].Groups[2].Value
}

$sourcePath = Join-Path $projectRoot "photos\$folder\$photoFile"

$shareImageDirectory = Join-Path $shareImageRoot $folder

New-Item `
    -ItemType Directory `
    -Path $shareImageDirectory `
    -Force | Out-Null

$shareImagePath = Join-Path $shareImageDirectory $photoFile

New-SocialPreview `
    -SourcePath $sourcePath `
    -OutputPath $shareImagePath

$imageUrl = "https://www.walkwithjohir.com/share-images/$folder/$photoFile"

        $shareUrl = "https://www.walkwithjohir.com/share/$folder/$photoNumber/"

        $websiteUrl = "https://www.walkwithjohir.com/#$folder/$photoNumber"

        $title = "$projectTitle"

        $description = "A photograph from $projectTitle by Johirul Islam."

        $outputDirectory = Join-Path $shareRoot "$folder\$photoNumber"

        New-Item `
            -ItemType Directory `
            -Path $outputDirectory `
            -Force | Out-Null

        $html = @"
<!DOCTYPE html>
<html lang="en">
<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1">

<title>$title | Walk with Johir</title>

<meta name="description"
      content="$description">

<meta property="og:type"
      content="website">

<meta property="og:title"
      content="$title">

<meta property="og:description"
      content="$description">

<meta property="og:image"
      content="$imageUrl">

<meta property="og:image:alt"
      content="$title">

<meta property="og:url"
      content="$shareUrl">

<meta property="og:site_name"
      content="Walk with Johir">

<meta name="twitter:card"
      content="summary_large_image">

<meta name="twitter:title"
      content="$title">

<meta name="twitter:description"
      content="$description">

<meta name="twitter:image"
      content="$imageUrl">

</head>

<body>

<div style="max-width:1000px;margin:40px auto;text-align:center;font-family:Arial,sans-serif;">

    <img
        src="$imageUrl"
        alt="$title"
        style="max-width:100%;height:auto;"
    >

    <h1>$title</h1>

    <p>$description</p>

    <p>
        <a href="$websiteUrl">
            Open photograph on Walk with Johir
        </a>
    </p>

</div>

<script>
setTimeout(function () {
    window.location.href = "$websiteUrl";
}, 1500);
</script>

</body>


</html>
"@

        $outputFile = Join-Path $outputDirectory "index.html"

        Set-Content `
            -Path $outputFile `
            -Value $html `
            -Encoding UTF8

        $totalPages++
    }
}

Write-Host ""
Write-Host "============================================"
Write-Host "Projects found: $totalProjects"
Write-Host "Share pages generated: $totalPages"
Write-Host "============================================"
Write-Host ""