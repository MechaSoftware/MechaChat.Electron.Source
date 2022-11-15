!macro customInstall
    CreateDirectory $APPDATA\MechaChat\assets
    CopyFiles $INSTDIR\assets\* $APPDATA\MechaChat\assets
    Delete $INSTDIR\assets*.*
    RMDir /r $INSTDIR\assets
!macroend