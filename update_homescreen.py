import re

with open('src/screens/HomeScreens/HomeScreen.tsx', 'r') as f:
    content = f.read()

# 1. Add Imports
if 'import RBSheet' not in content:
    content = content.replace(
        "import React, { memo, useCallback, useEffect, useRef, useState } from 'react';",
        "import React, { memo, useCallback, useEffect, useRef, useState } from 'react';\nimport RBSheet from 'react-native-raw-bottom-sheet';\nimport MultiSlider from '@ptomasroos/react-native-multi-slider';"
    )

if 'toggalOnButtonNew' not in content:
    content = content.replace(
        "import { directChatIcon",
        "import { toggalOnButtonNew, toggalOffButtonNew, serachButtonNew, resetButtonNew, directChatIcon"
    )
    
if 'FOURTEEN' not in content:
    content = content.replace(
        "import { AppText, INTER_MEDIUM",
        "import { AppText, INTER_MEDIUM, FOURTEEN, INTER_REGULAR"
    )

# 2. Add State and Refs
state_code = """    const [ageRange, setAgeRange] = useState([18, 60]);
    const [locationRadiusEnabled, setLocationRadiusEnabled] = useState(true);
    const [radius, setRadius] = useState([100]);
    const [photosOnly, setPhotosOnly] = useState(false);
    const filterSheetRef = useRef<any>(null);

    const onFilterPress = useCallback(() => {
        filterSheetRef.current?.open();
    }, []);
    
    const handleResetFilter = () => {
        setAgeRange([18, 60]);
        setLocationRadiusEnabled(true);
        setRadius([100]);
        setPhotosOnly(false);
    };

    const handleSearchFilter = () => {
        filterSheetRef.current?.close();
        // Trigger fetch logic here if needed
    };
"""
if 'const filterSheetRef' not in content:
    content = content.replace(
        "const [currentProfileData, setCurrentProfileData] = useState({})",
        "const [currentProfileData, setCurrentProfileData] = useState({})\n" + state_code
    )

# 3. Update NewHeaderAndroid usage
if 'onFilterPress={onFilterPress}' not in content:
    content = content.replace(
        "<NewHeaderAndroid />",
        "<NewHeaderAndroid onFilterPress={onFilterPress} />"
    )

# 4. Add RBSheet component
sheet_code = """
            {/* Filter RBSheet */}
            <RBSheet
                ref={filterSheetRef}
                closeOnDragDown={true}
                closeOnPressMask={true}
                customStyles={{
                    wrapper: {
                        backgroundColor: "rgba(0,0,0,0.5)"
                    },
                    draggableIcon: {
                        backgroundColor: colors.white
                    },
                    container: {
                        backgroundColor: colors.lightBack,
                        borderTopLeftRadius: metrics.hp3,
                        borderTopRightRadius: metrics.hp3,
                        paddingBottom: metrics.hp4
                    }
                }}
            >
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
                    <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color="#E6B7A8" style={styles.sheetTitle}>
                        Search Preferences
                    </AppText>
                    
                    <View style={styles.sheetSeparator} />

                    {/* Age Range */}
                    <AppText type={FOURTEEN} weight={INTER_SEMI_BOLD} color={WHITE} style={styles.filterLabel}>
                        Age range {ageRange[0]} - {ageRange[1]}
                    </AppText>
                    <View style={styles.sliderWrapper}>
                        <MultiSlider
                            values={[ageRange[0], ageRange[1]]}
                            sliderLength={metrics.wp80}
                            onValuesChange={(values) => setAgeRange(values)}
                            min={18}
                            max={60}
                            step={1}
                            selectedStyle={{ backgroundColor: "#D08FA9" }}
                            unselectedStyle={{ backgroundColor: "#555" }}
                            markerStyle={{ backgroundColor: "#D08FA9", height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 }}
                        />
                    </View>

                    <View style={styles.sheetSeparator} />

                    {/* Location Radius */}
                    <View style={styles.filterRow}>
                        <AppText type={FOURTEEN} weight={INTER_REGULAR} color={WHITE}>
                            Location Radius
                        </AppText>
                        <TouchableOpacityView onPress={() => setLocationRadiusEnabled(!locationRadiusEnabled)}>
                            <FastImage 
                                source={locationRadiusEnabled ? toggalOnButtonNew : toggalOffButtonNew} 
                                resizeMode="contain" 
                                style={styles.toggleIcon} 
                            />
                        </TouchableOpacityView>
                    </View>
                    <View style={styles.radiusLabels}>
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>0</AppText>
                        <AppText type={TWELVE} weight={INTER_SEMI_BOLD} color={WHITE}>200km</AppText>
                    </View>
                    <View style={styles.sliderWrapper}>
                        <MultiSlider
                            values={[radius[0]]}
                            sliderLength={metrics.wp80}
                            onValuesChange={(values) => setRadius(values)}
                            min={0}
                            max={200}
                            step={1}
                            selectedStyle={{ backgroundColor: "#D08FA9" }}
                            unselectedStyle={{ backgroundColor: "#555" }}
                            markerStyle={{ backgroundColor: "#D08FA9", height: metrics.hp2_5, width: metrics.hp2_5, marginTop: metrics.hp0_5 }}
                        />
                    </View>

                    <View style={styles.sheetSeparator} />

                    {/* Photos Only */}
                    <View style={styles.filterRow}>
                        <AppText type={FOURTEEN} weight={INTER_REGULAR} color={WHITE}>
                            Photos Only
                        </AppText>
                        <TouchableOpacityView onPress={() => setPhotosOnly(!photosOnly)}>
                            <FastImage 
                                source={photosOnly ? toggalOnButtonNew : toggalOffButtonNew} 
                                resizeMode="contain" 
                                style={styles.toggleIcon} 
                            />
                        </TouchableOpacityView>
                    </View>

                    <View style={styles.sheetSeparator} />

                    {/* Action Buttons */}
                    <View style={styles.filterActionRow}>
                        <TouchableOpacityView onPress={handleResetFilter}>
                            <FastImage source={resetButtonNew} resizeMode="contain" style={styles.actionBtnImage} />
                        </TouchableOpacityView>
                        <TouchableOpacityView onPress={handleSearchFilter}>
                            <FastImage source={serachButtonNew} resizeMode="contain" style={styles.actionBtnImage} />
                        </TouchableOpacityView>
                    </View>
                </ScrollView>
            </RBSheet>
"""
if '<RBSheet' not in content:
    content = content.replace(
        "        </AppSafeAreaView>",
        sheet_code + "\n        </AppSafeAreaView>"
    )

# 5. Add styles
styles_code = """
    sheetContent: {
        paddingHorizontal: metrics.hp3,
        paddingTop: metrics.hp1,
    },
    sheetTitle: {
        textAlign: "center",
        marginBottom: metrics.hp2,
    },
    sheetSeparator: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "rgba(255,255,255,0.1)",
        marginVertical: metrics.hp2,
    },
    filterLabel: {
        marginBottom: metrics.hp1,
    },
    sliderWrapper: {
        alignItems: "center",
        marginTop: metrics.hp1,
    },
    filterRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    toggleIcon: {
        height: metrics.hp3_5,
        width: metrics.hp6,
    },
    radiusLabels: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: metrics.hp2,
    },
    filterActionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: metrics.hp2,
    },
    actionBtnImage: {
        height: metrics.hp6,
        width: metrics.wp40,
    },"""
if 'sheetContent:' not in content:
    content = content.replace(
        "const styles = StyleSheet.create({",
        "const styles = StyleSheet.create({" + styles_code
    )

with open('src/screens/HomeScreens/HomeScreen.tsx', 'w') as f:
    f.write(content)
