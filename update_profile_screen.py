import re

filepath = "src/screens/ProfileScreens/ProfileScreenAndroid.tsx"
with open(filepath, "r") as f:
    content = f.read()

# 1. Replace TURN_ON_DATA with TURN_ON_IMAGES
turn_on_data_pattern = r'const TURN_ON_DATA = \[\s*\{.*?\}\s*\];'
turn_on_images = """const TURN_ON_IMAGES: any = {
    "Smooches": smooheshIcon,
    "Hugs": hugsIcon,
    "Massage": massageIcon,
    "Oral": oralIcon,
    "Dirty Talk": dirtyTalks,
    "Fantasies": fantasiesIcon,
    "Music": musicIcons,
    "Foot Fetish": fotFetiesIcon,
    "Scents": scentsIcon,
    "Biting": bitingIcon,
    "Hair": hairIcon,
    "Being Watched": beingWatchIcon,
    "Sexting": sextingIcon,
    "Room Service": roomServiceIcon,
    "Blindfolded": blinedFlodedIcon,
    "Tattoos": TattosIcon,
    "Dance": danceNewIcon,
    "Role-Play": rolePlayImageNew,
    "Chocolate": choclateImageNew,
    "Touch": touchNewIcon,
};"""

content = re.sub(turn_on_data_pattern, turn_on_images, content, flags=re.DOTALL)

# 2. Add turnOnData and initialize effect
state_injection_pattern = r'(const userData = useSelector\(\(state: any\) => state\.auth\.userData\);\s*const profileHide = useSelector\(\(state: any\) => state\.auth\.profileHide\);)'
state_injection = r"""\1
    const turnOnData = useSelector((state: any) => state?.auth?.turnOnData);
    
    useEffect(() => {
        if (userData?.turnOns) {
            const initialTurnOnIds = userData.turnOns.map((t: any) => t._id || t.id);
            setSelectedTurnOnIds(initialTurnOnIds);
        }
    }, [userData?.turnOns]);"""
content = re.sub(state_injection_pattern, state_injection, content)

# 3. Replace handleTurnOnSelect and renderTurnOnItem
render_pattern = r'const handleTurnOnSelect = \(id: any\) => \{.*?\};.*?const isPickerOpenRef = useRef\(false\);'
new_render = """const handleTurnOnSelect = async (id: any) => {
        const isSelected = selectedTurnOnIds.includes(id);
        const newSelectedIds = isSelected
            ? selectedTurnOnIds.filter((item: any) => item !== id)
            : [...selectedTurnOnIds, id];

        setSelectedTurnOnIds(newSelectedIds);

        try {
            await dispatch(editProfile({ attributes: newSelectedIds }, false) as any);
        } catch (e) {
            // Revert on failure
            setSelectedTurnOnIds(selectedTurnOnIds);
            toastAlert.showToastError("Failed to update turn ons");
        }
    };

    const renderTurnOnItem = ({ item }: any) => {
        const isSelected = selectedTurnOnIds.includes(item._id);
        return (
            <TouchableOpacityView activeOpacity={1} onPress={() => handleTurnOnSelect(item._id)}>
                <ImageBackground source={trunOnBackground} tintColor={isSelected ? "#E6B7A8" : "#555359"} resizeMode="cover" style={styles.turnOnTrunback}>
                    <FastImage source={TURN_ON_IMAGES[item.value]} resizeMode="contain" style={styles.turnOnImagesIcon} />
                    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: metrics.hp2 }}>
                        <AppText style={{ color: isSelected ? newColor.blackNew : "#E6B7A8" }} type={EIGHTEEN} weight={SCHEHERAZADE_BOLD}>
                            {item.value}
                        </AppText>
                        <AppText type={ELEVEN} style={{ textAlign: "center", marginTop: -metrics.hp1, color: isSelected ? newColor.blackNew : colors.white, opacity: isSelected ? 0.8 : 1 }}>
                            {item.message}
                        </AppText>
                    </View>
                    {isSelected ?
                        <FastImage source={rightSelectTrunOns} resizeMode="contain" style={{ height: metrics.hp3, width: metrics.hp3, position: "absolute", right: metrics.hp2, bottom: metrics.hp2 }} /> : null}
                </ImageBackground>
            </TouchableOpacityView>
        )
    };
    const isPickerOpenRef = useRef(false);"""

content = re.sub(render_pattern, new_render, content, flags=re.DOTALL)

# 4. Replace FlatList data source
flatlist_pattern = r'data=\{TURN_ON_DATA\}'
flatlist_new = r'data={turnOnData}'
content = re.sub(flatlist_pattern, flatlist_new, content)

with open(filepath, "w") as f:
    f.write(content)
