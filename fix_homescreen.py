import re

with open('src/screens/HomeScreens/HomeScreen.tsx', 'r') as f:
    content = f.read()

# Fix RBSheet props
content = content.replace("closeOnDragDown={true}", "draggable={true}")
content = content.replace("closeOnPressMask={true}", "")

# Fix metrics wp40
content = content.replace("width: metrics.wp40,", "width: '45%',")

with open('src/screens/HomeScreens/HomeScreen.tsx', 'w') as f:
    f.write(content)
