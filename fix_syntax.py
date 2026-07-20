def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix the return / const mess
    content = content.replace('retu    const isMalePremium', '    const isMalePremium')

    # Fix f-string brace missing issues
    content = content.replace("style={ flex: 1, backgroundColor: isMalePremium ? 'transparent' : newColor.blackNew }", 
                              "style={{ flex: 1, backgroundColor: isMalePremium ? 'transparent' : newColor.blackNew }}")
    
    content = content.replace("style={\n                        position: 'absolute',", 
                              "style={{\n                        position: 'absolute',")
    content = content.replace('justifyContent: "center"\n                    }>', 
                              'justifyContent: "center"\n                    }}>')
                              
    content = content.replace('style={ height: metrics.hp7, position: "absolute"', 
                              'style={{ height: metrics.hp7, position: "absolute"')
    content = content.replace('backgroundColor: "#00000050", zIndex: 10 }>', 
                              'backgroundColor: "#00000050", zIndex: 10 }}>')
                              
    content = content.replace('style={ color: "#D08FA9", marginTop: metrics.hp0_5, textAlign: "center" }>', 
                              'style={{ color: "#D08FA9", marginTop: metrics.hp0_5, textAlign: "center" }}>')
                              
    # The source prop in ImageBackground
    content = content.replace('source={whoVisitYourProfileWithOutPurches}', 'source={whoVisitYourProfileWithOutPurches}')

    # TouchableOpacity activeOpacity
    content = content.replace('activeOpacity={1}', 'activeOpacity={1}')

    with open(filepath, 'w') as f:
        f.write(content)
        print(f"Fixed {filepath}")

fix_file('src/screens/LikesYouScreens/LikesYouScreen.tsx')
fix_file('src/screens/LikesYouScreens/ViewYouScreen.tsx')
