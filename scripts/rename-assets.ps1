$paths = @('./assets')
$mapping = 'rename-mapping.txt'
Remove-Item $mapping -ErrorAction SilentlyContinue
foreach ($path in $paths) {
  Get-ChildItem -Recurse $path -Include *.png,*.jpg,*.jpeg,*.gif,*.webp,*.svg -File |
    ForEach-Object {
      $old = $_.Name
      $new = $old.ToLower() -replace '[-\s]', '_'
      if ($new -match '^[0-9]') { $new = 'img_' + $new }
      Rename-Item $_.FullName $new
      "$old -> $new" | Out-File $mapping -Append
    }
}
# Update code references
Get-Content $mapping | ForEach-Object {
  $parts = $_ -split ' -> '
  $old = [regex]::Escape($parts[0])
  $new = $parts[1]
  Get-ChildItem -Recurse ./src -Include *.js,*.jsx,*.ts,*.tsx -File |
    ForEach-Object {
      (Get-Content $_) -replace $old, $new | Set-Content $_
    }
} 