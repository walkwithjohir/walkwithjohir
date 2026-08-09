$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$photoJsPath = Join-Path $projectRoot "photo.js"
$shareRoot = Join-Path $projectRoot "share"

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

    

    $photoMatches = [regex]::Matches(
        $photosBlock,
        '"([^"]+)"'
    )

    if ($photoMatches.Count -eq 0) {
        continue
    }

    $totalProjects++

    Write-Host "$projectTitle : $($photoMatches.Count) photos"

    for ($i = 0; $i -lt $photoMatches.Count; $i++) {

        $photoNumber = $i + 1
        $photoFile = $photoMatches[$i].Groups[1].Value

        $imageUrl = "https://www.walkwithjohir.com/photos/$folder/$photoFile"

        $shareUrl = "https://www.walkwithjohir.com/share/$folder/$photoNumber/"

        $websiteUrl = "https://www.walkwithjohir.com/#$folder/$photoNumber"

        $title = "$projectTitle - Photo $photoNumber"

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

<meta http-equiv="refresh"
      content="0; url=$websiteUrl">

</head>

<body>

<p>
Opening
<a href="$websiteUrl">
$title
</a>
</p>

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