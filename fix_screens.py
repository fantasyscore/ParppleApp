import re

def process_file(filepath, is_likes_you):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the 'if (userData?.gender === "male")' block
    block_start = content.find('if (userData?.gender === "male") {')
    if block_start == -1:
        print(f"Could not find block in {filepath}")
        return
        
    block_end = content.find('return (', block_start)
    block_end = content.find('</ImageBackground>', block_end)
    block_end = content.find('}', block_end) + 1
    
    # Extract the block
    old_block = content[block_start:block_end]
    
    # The return AppSafeAreaView part
    app_safe_area_start = content.find('<AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>', block_end)
    
    if app_safe_area_start == -1:
        print(f"Could not find AppSafeAreaView in {filepath}")
        return
        
    # Replace the old block with an empty string
    content = content[:block_start] + content[block_end:]
    
    # Recalculate app_safe_area_start after removing old block
    app_safe_area_start = content.find('<AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>')
    
    # Find the end of AppSafeAreaView
    app_safe_area_end = content.find('</AppSafeAreaView>', app_safe_area_start) + len('</AppSafeAreaView>')
    
    safe_area_content = content[app_safe_area_start:app_safe_area_end]
    new_safe_area_content = safe_area_content.replace(
        '<AppSafeAreaView style={{ flexGrow: 1 }} color={newColor.blackNew}>',
        '<AppSafeAreaView style={{ flexGrow: 1 }} color={isMalePremium ? "transparent" : newColor.blackNew}>'
    )
    
    # Text content based on screen
    if is_likes_you:
        texts = """
                <AppText weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", fontSize: fontSize(40) }}>
                    Who send
                </AppText>
                <AppText type={THIRTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp7, fontSize: fontSize(40) }}>
                    You a heart?
                </AppText>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp3 }}>
                    Someone Couldn't Resist Taking a Look.
                </AppText>
"""
    else:
        texts = """
                <AppText weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", fontSize: fontSize(40) }}>
                    Who’s
                </AppText>
                <AppText type={THIRTY} weight={SCHEHERAZADE_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp7, fontSize: fontSize(40) }}>
                    watching You?
                </AppText>
                <AppText type={FORTEEN} weight={INTER_SEMI_BOLD} style={{ color: "#D08FA9", marginTop: -metrics.hp3 }}>
                    Let Your Mystery Drew Someone In.
                </AppText>
"""

    wrapper = f"""    const isMalePremium = userData?.gender === "male";

    return (
        <View style={{ flex: 1, backgroundColor: isMalePremium ? 'transparent' : newColor.blackNew }}>
            {{isMalePremium && (
                <ImageBackground source={{whoVisitYourProfileWithOutPurches}} resizeMode="stretch"
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: -metrics.hp12,
                        zIndex: -1,
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
{texts}
                    <TouchableOpacity activeOpacity={{1}} onPress={{()=>NavigationService.navigate(NAVIGATION_SUBSCRIPTION_SCREEN)}} style={{ height: metrics.hp7, position: "absolute", bottom: metrics.hp12, borderWidth: metrics.hp0_1, borderColor: "#D08FA9", width: "95%", backgroundColor: "#00000050", zIndex: 10 }}>
                        <AppText type={{TWENTY}} weight={{SCHEHERAZADE_BOLD}} style={{ color: "#D08FA9", marginTop: metrics.hp0_5, textAlign: "center" }}>
                            Unlock Now
                        </AppText>
                    </TouchableOpacity>
                </ImageBackground>
            )}}
            {new_safe_area_content}
        </View>
    );"""

    # Replace the old return statement with the new wrapper
    final_content = content[:app_safe_area_start-13] + wrapper + content[app_safe_area_end+7:]
    
    with open(filepath, 'w') as f:
        f.write(final_content)
        print(f"Updated {filepath}")

process_file('src/screens/LikesYouScreens/LikesYouScreen.tsx', True)
process_file('src/screens/LikesYouScreens/ViewYouScreen.tsx', False)

