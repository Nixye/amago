Add-Type -AssemblyName System.Drawing
$images = @()
foreach ($size in @(16,24,32,48,64,128,256)) {
  $bitmap = [System.Drawing.Bitmap]::new($size,$size)
  $g = [System.Drawing.Graphics]::FromImage($bitmap)
  $g.SmoothingMode = 'AntiAlias'
  $g.ScaleTransform($size/256.0,$size/256.0)
  $shape = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $shape.AddArc(4,4,108,108,180,90); $shape.AddArc(144,4,108,108,270,90); $shape.AddArc(144,144,108,108,0,90); $shape.AddArc(4,144,108,108,90,90); $shape.CloseFigure()
  $tile = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(0,0),[System.Drawing.Point]::new(256,256),[System.Drawing.ColorTranslator]::FromHtml('#172b48'),[System.Drawing.ColorTranslator]::FromHtml('#080d1c'))
  $g.FillPath($tile,$shape)
  $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Point]::new(60,60),[System.Drawing.Point]::new(195,195),[System.Drawing.ColorTranslator]::FromHtml('#9bf3e6'),[System.Drawing.ColorTranslator]::FromHtml('#a995ff'))
  $pen = [System.Drawing.Pen]::new($gradient,9); $pen.LineJoin='Round'
  $points = [System.Drawing.Point[]]@([System.Drawing.Point]::new(128,62),[System.Drawing.Point]::new(190,128),[System.Drawing.Point]::new(128,194),[System.Drawing.Point]::new(66,128))
  $fill = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(30,120,225,225)); $g.FillPolygon($fill,$points); $g.DrawPolygon($pen,$points)
  $pen.Width=3; $g.DrawLine($pen,66,128,190,128)
  $inner = [System.Drawing.Point[]]@([System.Drawing.Point]::new(128,62),[System.Drawing.Point]::new(152,128),[System.Drawing.Point]::new(128,194),[System.Drawing.Point]::new(104,128)); $g.DrawPolygon($pen,$inner)
  $ring = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(95,145,203,240),3)
  $outer = [System.Drawing.Point[]]@([System.Drawing.Point]::new(128,39),[System.Drawing.Point]::new(203,84),[System.Drawing.Point]::new(203,172),[System.Drawing.Point]::new(128,217),[System.Drawing.Point]::new(53,172),[System.Drawing.Point]::new(53,84)); $g.DrawPolygon($ring,$outer)
  $center = [System.Drawing.Point[]]@([System.Drawing.Point]::new(128,111),[System.Drawing.Point]::new(145,128),[System.Drawing.Point]::new(128,145),[System.Drawing.Point]::new(111,128))
  $glow = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#c6fff5')); $g.FillPolygon($glow,$center); $g.FillEllipse($glow,48,79,10,10); $g.FillEllipse($gradient,198,167,10,10)
  $memory=[System.IO.MemoryStream]::new(); $bitmap.Save($memory,[System.Drawing.Imaging.ImageFormat]::Png); $images += ,$memory.ToArray()
  if($size -eq 256){$bitmap.Save((Join-Path $PSScriptRoot '../dist/assets/amago-icon.png'),[System.Drawing.Imaging.ImageFormat]::Png)}
  $memory.Dispose();$pen.Dispose();$ring.Dispose();$fill.Dispose();$glow.Dispose();$gradient.Dispose();$tile.Dispose();$shape.Dispose();$g.Dispose();$bitmap.Dispose()
}
$stream=[System.IO.File]::Create((Join-Path $PSScriptRoot 'icon.ico'));$writer=[System.IO.BinaryWriter]::new($stream)
$writer.Write([uint16]0);$writer.Write([uint16]1);$writer.Write([uint16]$images.Count)
$offset=6+16*$images.Count;$sizes=@(16,24,32,48,64,128,256)
for($i=0;$i -lt $images.Count;$i++){ $dimension=if($sizes[$i] -eq 256){0}else{$sizes[$i]};$writer.Write([byte]$dimension);$writer.Write([byte]$dimension);$writer.Write([byte]0);$writer.Write([byte]0);$writer.Write([uint16]1);$writer.Write([uint16]32);$writer.Write([uint32]$images[$i].Length);$writer.Write([uint32]$offset);$offset+=$images[$i].Length }
foreach($bytes in $images){$writer.Write([byte[]]$bytes)};$writer.Dispose()
