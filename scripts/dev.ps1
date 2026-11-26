param(
  [ValidateSet("up", "down", "restart", "status", "logs")]
  [string]$Command = "status"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

function Invoke-Dev {
  param([string]$Action)
  node (Join-Path $PSScriptRoot "dev-ctl.cjs") $Action
}

switch ($Command) {
  "up" { Invoke-Dev "start" }
  "down" { Invoke-Dev "stop" }
  default { Invoke-Dev $Command }
}
