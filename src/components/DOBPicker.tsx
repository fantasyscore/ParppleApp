import React, { memo, useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import BottomSheet from "./BottomSheet";
import WheelPicker, {
    WHEEL_ITEM_HEIGHT,
    WHEEL_VISIBLE_ROWS,
} from "./WheelPicker";
import { TouchableOpacityView } from "../common/TouchableOpacityView";
import { AppText, EIGHTEEN, SCHEHERAZADE_BOLD, SCHEHERAZADE_SEMI_BOLD, SIXTEEN, TWENTY, TWENTY_FOUR, WHITE } from "../common/AppText";
import metrics from "../assets/Metrics";

export interface DOBPickerProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (date: Date) => void;
    /** Initial date shown when the sheet opens. Defaults to 17 July 1998. */
    initialDate?: Date;
    minYear?: number;
    title?: string;
    /** Minimum age required. Defaults to 18 — dates newer than today - minAge are not scrollable. */
    minAge?: number;
}

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

const SHEET_BG = "#151517";
const WHEEL_HEIGHT = WHEEL_ITEM_HEIGHT * WHEEL_VISIBLE_ROWS;
const CENTER_TOP = WHEEL_ITEM_HEIGHT * Math.floor(WHEEL_VISIBLE_ROWS / 2);

const daysInMonth = (monthIndex: number, year: number) =>
    new Date(year, monthIndex + 1, 0).getDate();

/**
 * Custom Date-of-Birth wheel picker inside a bottom sheet.
 * Fully custom UI — no native DatePicker / datetimepicker.
 */
const DOBPicker = ({
    visible,
    onClose,
    onConfirm,
    initialDate = new Date(1998, 6, 17),
    minYear = 1950,
    title = "Select Date of Birth",
    minAge = 18,
}: DOBPickerProps) => {
    // Latest selectable DOB = today minus minAge years (recomputed from the
    // device date on every render, so it rolls over automatically each day).
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    const maxYear = maxDate.getFullYear();
    const maxMonthIndex = maxDate.getMonth();
    const maxDay = maxDate.getDate();

    const years = useMemo(() => {
        const list: string[] = [];
        for (let y = minYear; y <= maxYear; y++) list.push(String(y));
        return list;
    }, [minYear, maxYear]);

    // Clamp the initial date into the allowed range before seeding state.
    const safeInitial = initialDate > maxDate ? maxDate : initialDate;

    const [dayIndex, setDayIndex] = useState(safeInitial.getDate() - 1);
    const [monthIndex, setMonthIndex] = useState(safeInitial.getMonth());
    const [yearIndex, setYearIndex] = useState(
        Math.min(
            Math.max(safeInitial.getFullYear() - minYear, 0),
            maxYear - minYear
        )
    );

    const year = minYear + yearIndex;

    // On the max year, months after the cutoff are simply not in the list,
    // so they can never be scrolled to.
    const months = useMemo(
        () => (year === maxYear ? MONTHS.slice(0, maxMonthIndex + 1) : MONTHS),
        [year, maxYear, maxMonthIndex]
    );

    const clampedMonthIndex = Math.min(monthIndex, months.length - 1);

    // Day list reacts to month/year so Feb, leap years etc. stay correct,
    // and is capped at the cutoff day on the max year + max month.
    const days = useMemo(() => {
        let count = daysInMonth(clampedMonthIndex, year);
        if (year === maxYear && clampedMonthIndex === maxMonthIndex) {
            count = Math.min(count, maxDay);
        }
        return Array.from({ length: count }, (_, i) => String(i + 1));
    }, [clampedMonthIndex, year, maxYear, maxMonthIndex, maxDay]);

    const clampedDayIndex = Math.min(dayIndex, days.length - 1);

    const onMonthChange = useCallback((index: number) => {
        setMonthIndex(index);
    }, []);

    const onYearChange = useCallback((index: number) => {
        setYearIndex(index);
    }, []);

    const onDayChange = useCallback((index: number) => {
        setDayIndex(index);
    }, []);

    const handleConfirm = useCallback(() => {
        // Wheels can't reach an invalid date, but clamp once more as a
        // safety net so callers only ever receive an 18+ DOB.
        let result = new Date(year, clampedMonthIndex, clampedDayIndex + 1);
        if (result > maxDate) result = maxDate;
        onConfirm(result);
        onClose();
    }, [onConfirm, onClose, year, clampedMonthIndex, clampedDayIndex, maxDate]);

    return (
        <BottomSheet visible={visible} onClose={onClose}>
            <AppText type={TWENTY_FOUR} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE} style={styles.title}>{title}</AppText>

            <View style={styles.labelRow}>
                <AppText  type={EIGHTEEN} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE}  style={styles.label}>Day{"   "}</AppText>
                <AppText type={EIGHTEEN} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE} style={styles.label}>Month</AppText>
                <AppText type={EIGHTEEN} weight={SCHEHERAZADE_SEMI_BOLD} color={WHITE} style={styles.label}>{" "}Year</AppText>
            </View>

            <View style={styles.wheelsRow}>
                <WheelPicker
                    data={days}
                    selectedIndex={clampedDayIndex}
                    onChange={onDayChange}
                    width="28%"
                />
                <WheelPicker
                    data={months}
                    selectedIndex={clampedMonthIndex}
                    onChange={onMonthChange}
                    width="42%"
                />
                <WheelPicker
                    data={years}
                    selectedIndex={yearIndex}
                    onChange={onYearChange}
                    width="30%"
                    year={true}
                />

                {/* Two thin selection lines across all three wheels */}
                <View pointerEvents="none" style={[styles.selectionLine, { top: CENTER_TOP }]} />
                <View
                    pointerEvents="none"
                    style={[styles.selectionLine, { top: CENTER_TOP + WHEEL_ITEM_HEIGHT }]}
                />

                {/* Fade masks above / below the selection */}
                <LinearGradient
                    pointerEvents="none"
                    colors={[SHEET_BG, `${SHEET_BG}00`]}
                    style={[styles.fade, { top: 0 }]}
                />
                <LinearGradient
                    pointerEvents="none"
                    colors={[`${SHEET_BG}00`, SHEET_BG]}
                    style={[styles.fade, { bottom: 0 }]}
                />
            </View>

            <TouchableOpacityView style={styles.okButton} onPress={handleConfirm}>
                <AppText type={EIGHTEEN} weight={SCHEHERAZADE_BOLD} style={styles.okText}>OK</AppText>
            </TouchableOpacityView>
        </BottomSheet>
    );
};

export default memo(DOBPicker);

const styles = StyleSheet.create({
    title: {
        textAlign: "center",
        marginBottom: metrics.hp1_4,
        marginTop:-metrics.hp1_5
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop:-metrics.hp2
    },
    label: {
        width:"32.33%",
        textAlign: "center",
    },
    wheelsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        height: WHEEL_HEIGHT,
    },
    selectionLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: StyleSheet.hairlineWidth * 2,
        backgroundColor: "#FFFFFF",
    },
    fade: {
        position: "absolute",
        left: 0,
        right: 0,
        height: WHEEL_ITEM_HEIGHT * 1.2,
    },
    okButton: {
        marginTop: metrics.hp2,
        height: metrics.hp5_5,
        borderWidth: 1.5,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
    },
    okText: {
        color: "#FFFFFF",
    },
});
