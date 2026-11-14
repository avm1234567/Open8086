' EMU8086 PRO - Silent Desktop Launcher
Dim WshShell, fso, currentDir, htmlPath, uri

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
htmlPath = fso.BuildPath(currentDir, "index.html")

If Not fso.FileExists(htmlPath) Then
    MsgBox "index.html was not found in: " & currentDir, vbCritical, "EMU8086 PRO"
    WScript.Quit
End If

uri = "file:///" & Replace(htmlPath, "\", "/")

On Error Resume Next

' Try Edge App Mode (Standalone borderless app window)
WshShell.Run "msedge.exe --app=""" & uri & """ --window-size=1360,860", 1, False
If Err.Number = 0 Then WScript.Quit
Err.Clear

' Try Chrome App Mode
WshShell.Run "chrome.exe --app=""" & uri & """ --window-size=1360,860", 1, False
If Err.Number = 0 Then WScript.Quit
Err.Clear

' Fallback to default browser
WshShell.Run """" & uri & """", 1, False
