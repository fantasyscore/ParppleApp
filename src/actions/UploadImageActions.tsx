import Toast from 'react-native-toast-message';
import { interBold, interSemiBold, ScheherazadeNewBold } from '../theme/typography';
import { fontSize } from '../common/AppText';
import { colors } from '../theme/colors';
export const uploadImageCloud = async (imageUri: any) => {
    const CLOUD_NAME = "dmclc6ifo";
    const UPLOAD_PRESET = "react_native_upload";

    try {
        let data = new FormData();
        data.append("file", {
            uri: imageUri,
            type: "image/jpeg",
            name: "upload.jpeg",
        });
        data.append("upload_preset", UPLOAD_PRESET);
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: data,
          });
        const result = await res.json();
        return result.secure_url;
    } catch (error) {
        console.log(error);
        throw error
    }
};
export const toastAlert = {
    showToastError: (message: string, duration = 2500) => {
      Toast.show({
        type: 'success',
        text2: `${message}`,
        text2Style: { fontSize: fontSize(14), fontFamily: ScheherazadeNewBold, color:colors.white },
        text1Style: { fontSize: fontSize(14), fontFamily: ScheherazadeNewBold, color:colors.white },
      })
    },
  };