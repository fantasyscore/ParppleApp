import re

with open('src/screens/HomeScreens/ViewProfileAndroid.tsx', 'r') as f:
    content = f.read()

# Replace Component Name and Props
content = content.replace(
    'const ViewProfileAndroid = ({ currentProfileData, setModalVisible, handleDislikePress, handleLikePress }: any) => {',
    'const ProfilePreviewNew = () => {'
)

content = content.replace('export default ViewProfileAndroid;', 'export default ProfilePreviewNew;')

# Add imports
imports_to_add = 'import { useSelector } from "react-redux";\nimport NavigationService from "../../navigation/NavigationService";\n'
content = content.replace('import React, { useRef, useState } from "react";', 'import React, { useRef, useState } from "react";\n' + imports_to_add)

# Add userData hook and replace state
content = content.replace(
    'const scrollX = useRef(new Animated.Value(0)).current;\n    const [selectedIds, setSelectedIds] = useState([]);',
    'const scrollX = useRef(new Animated.Value(0)).current;\n    const userData = useSelector((state: any) => state?.auth?.userData);\n    const selectedIds = userData?.turnOn || userData?.turnOns || [];'
)

# Remove blurRadius and lockOverlay
content = content.replace('blurRadius={10} ', '')
lock_overlay_regex = r'<View style=\{styles.lockOverlay\}>.*?<\/View>'
content = re.sub(lock_overlay_regex, '', content, flags=re.DOTALL)

# Data Mapping Replacements
content = content.replace('currentProfileData?.gallery[0]?.url', '(userData?.gallery?.[0]?.url || userData?.gallery?.[0]?.uri)')
content = content.replace('currentProfileData?.gallery', '(userData?.gallery || [])')
content = content.replace('currentProfileData?.name', '(userData?.firstName || userData?.name || "User")')
content = content.replace('currentProfileData?.gender', '(userData?.gender || userData?.sexualOrientation || "")')
content = content.replace('currentProfileData?.age', '(userData?.age || "")')
content = content.replace('currentProfileData?.distanceInKm', '("0")')
content = content.replace('currentProfileData?.height', '(userData?.height || "")')
content = content.replace('currentProfileData?.city', '(userData?.city || userData?.homeTown || "")')
content = content.replace('currentProfileData.bio', '(userData?.bio || "No bio available.")')
content = content.replace('currentProfileData', 'userData')

# Header Replacement
content = content.replace(
    '<NewHeader title={"Mysterious Waves"} onPress={() => setModalVisible(false)} />',
    '<NewHeader title={userData?.firstName || userData?.name || "Profile Preview"} onPress={() => NavigationService.goBack()} />'
)

# Remove Action Buttons
actions_regex = r'<View style=\{styles.actionsRow\}>.*?<\/View>'
content = re.sub(actions_regex, '', content, flags=re.DOTALL)

# Also remove handleSelect since we are not selecting anything in preview
handle_select_regex = r'const handleSelect = \(id: any\) => \{.*?set.*?\}\);.*?\}'
# wait, actually the multiline regex for handleSelect might fail. I'll just keep it and let it do nothing or remove the onPress.
content = content.replace('onPress={() => handleSelect(item.id)}', 'onPress={() => {}}')

with open('src/screens/ProfileScreens/ProfilePreviewNew.tsx', 'w') as f:
    f.write(content)
