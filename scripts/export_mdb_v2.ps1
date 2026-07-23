$conn = New-Object -ComObject ADODB.Connection
$conn.Open("Provider=Microsoft.ACE.OLEDB.12.0;Data Source=C:\Users\19821\Desktop\智能菜谱app\菜谱数据库.mdb")

$typeMap = @{}
$rs = $conn.Execute("SELECT [节点ID], [类型名称] FROM [类型树]")
while (-not $rs.EOF) {
    $typeMap[[string]$rs.Fields("节点ID").Value] = $rs.Fields("类型名称").Value
    $rs.MoveNext()
}
$rs.Close()

$rs = $conn.Execute("SELECT * FROM [菜谱]")
$recipes = @()
$count = 0
while (-not $rs.EOF) {
    $typeId = [string]$rs.Fields("菜谱类型号").Value
    $category = if ($typeMap.ContainsKey($typeId)) { $typeMap[$typeId] } else { "其他" }
    
    # Merge ingredients + seasonings
    $rawYuanLiao = $rs.Fields("原料").Value
    $rawTiaoLiao = $rs.Fields("调料").Value
    $ingredients = @()
    
    if ($rawYuanLiao -and $rawYuanLiao.ToString().Trim()) {
        $rawYuanLiao.ToString() -split '[,，、；;]' | ForEach-Object { $t = $_.Trim(); if ($t -and $t -ne '等' -and $t -ne '等。') { $ingredients += $t } }
    }
    if ($rawTiaoLiao -and $rawTiaoLiao.ToString().Trim()) {
        $rawTiaoLiao.ToString() -split '[,，、；;]' | ForEach-Object { $t = $_.Trim(); if ($t -and $t -ne '等' -and $t -ne '等。') { $ingredients += $t } }
    }
    
    $rawSteps = $rs.Fields("做法").Value
    $steps = @()
    if ($rawSteps -and $rawSteps.ToString().Trim()) {
        $steps = $rawSteps.ToString() -split '\r?\n' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    }
    
    $recipe = @{
        id = [string]$rs.Fields("菜谱ID").Value
        name = $rs.Fields("菜谱名称").Value
        category = $category
        image_url = ""
        ingredients = $ingredients
        steps = $steps
        prep_time = 10
        cook_time = 15
        created_at = "2026-07-23T00:00:00.000Z"
        updated_at = "2026-07-23T00:00:00.000Z"
    }
    $recipes += $recipe
    $count++
    $rs.MoveNext()
}
$rs.Close()
$conn.Close()

Write-Host "Exported $count recipes with merged ingredients+seasonings"

$output = @{ recipes = $recipes }
$output | ConvertTo-Json -Depth 5 -Compress | Out-File -Encoding UTF8 "C:\Users\19821\Desktop\智能菜谱app\data\mdb_export.json"
Write-Host "Done"