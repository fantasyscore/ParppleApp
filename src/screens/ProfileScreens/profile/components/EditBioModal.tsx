import React, { useEffect, useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import metrics from "../../../../assets/Metrics";
import { colors } from "../../../../theme/colors";
import { AppText, BLACK, FORTEEN, INTER_BOLD, OPECITY_DARK, RED, SCHEHERAZADE_BOLD, SIXTEEN, TEN, TWELVE, WHITE } from "../../../../common/AppText";
import { TouchableOpacityView } from "../../../../common/TouchableOpacityView";
import PremiumAnimatedModal from "../../../../common/PremiumAnimatedModal";

const MAX_BIO_LENGTH = 200;

interface EditBioModalProps {
  visible: boolean;
  /** Bio shown when the modal opens */
  initialBio: string;
  onClose: () => void;
  onSave: (bio: string) => void;
}

/** Edit-bio dialog: a 200 character text box with Cancel / Update. */
const EditBioModal = ({ visible, initialBio, onClose, onSave }: EditBioModalProps) => {
  const [bio, setBio] = useState(initialBio);
  const [error, setError] = useState("");

  // Start from the saved bio every time the dialog opens
  useEffect(() => {
    if (visible) {
      setBio(initialBio);
      setError("");
    }
  }, [visible, initialBio]);

  const submit = () => {
    const trimmed = bio.trim();
    if (trimmed.length === 0) {
      setError("Bio cannot be empty.");
      return;
    }
    onSave(trimmed);
  };

  return (
    <PremiumAnimatedModal visible={visible} onClose={onClose}>
      <AppText type={SIXTEEN} weight={SCHEHERAZADE_BOLD} color={WHITE} style={styles.title}>
        Edit Bio
      </AppText>

      <View style={styles.inputBox}>
        <TextInput
          style={styles.input}
          multiline
          maxLength={MAX_BIO_LENGTH}
          autoFocus={true}
          blurOnSubmit={false}
          placeholder="Write something about yourself..."
          placeholderTextColor="#FAFAFA66"
          value={bio}
          onChangeText={(text) => {
            setBio(text);
            setError("");
          }}
        />
        <AppText type={TEN} color={bio.length >= MAX_BIO_LENGTH ? RED : OPECITY_DARK} style={styles.counter}>
          {bio.length} / {MAX_BIO_LENGTH}
        </AppText>
      </View>

      {error ? (
        <AppText type={TWELVE} color={RED} style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <View style={styles.buttons}>
        <TouchableOpacityView onPress={onClose} style={[styles.button, styles.cancel]}>
          <AppText type={FORTEEN} weight={INTER_BOLD} color={WHITE}>
            Cancel
          </AppText>
        </TouchableOpacityView>
        <TouchableOpacityView onPress={submit} style={[styles.button, styles.update]}>
          <AppText type={FORTEEN} weight={INTER_BOLD} color={BLACK}>
            Update
          </AppText>
        </TouchableOpacityView>
      </View>
    </PremiumAnimatedModal>
  );
};

export default EditBioModal;

const styles = StyleSheet.create({
  title: {
    marginBottom: metrics.hp2,
  },
  inputBox: {
    backgroundColor: "#151517",
    padding: metrics.hp1_5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    marginTop: -metrics.hp2,
  },
  input: {
    color: colors.white,
    fontSize: 14,
    minHeight: metrics.hp10,
    textAlignVertical: "top",
  },
  counter: {
    alignSelf: "flex-end",
    marginTop: metrics.hp1,
  },
  error: {
    marginTop: metrics.hp1,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: metrics.hp3,
  },
  button: {
    flex: 1,
    height: metrics.hp6,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginRight: metrics.hp1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  update: {
    backgroundColor: "#E6B7A8",
    marginLeft: metrics.hp1,
  },
});
