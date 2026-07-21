import re

def process():
    filepath = 'src/screens/DetailsScreen/AddPhotosScreen.tsx'
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Imports
    if "import FaceMaskModal" not in content:
        import_str = 'import { setAddProfile } from "../../slices/loginServices/authSlice";\nimport FaceMaskModal from "./FaceMaskModal";\nimport { analyzeFaceForMask, FaceMaskAnalysis } from "../../helper/faceMask";\n'
        content = content.replace('import { setAddProfile } from "../../slices/loginServices/authSlice";\n', import_str)

    # 2. Add FaceMask state and functions
    if "const [maskModalState, setMaskModalState]" not in content:
        state_str = """
  const [photos, setPhotos] = useState(
    Array(4)
      .fill({ id: "", image: "", imageId: "", loading: false })
      .map((_, i) => ({ id: String(i + 1), image: "", imageId: "", loading: false, maskId: null }))
  );

  const [maskModalState, setMaskModalState] = useState<{
    visible: boolean;
    imageUri: string;
    analysis: FaceMaskAnalysis | null;
  }>({ visible: false, imageUri: "", analysis: null });

  const maskModalResolveRef = useRef<((maskId: string | null) => void) | null>(null);

  const waitForMaskSelection = (imageUri: string, analysis: FaceMaskAnalysis): Promise<string | null> =>
    new Promise((resolve) => {
      maskModalResolveRef.current = resolve;
      setMaskModalState({ visible: true, imageUri, analysis });
    });

  const onMaskModalDone = (maskId: string | null) => {
    setMaskModalState({ visible: false, imageUri: "", analysis: null });
    if (maskModalResolveRef.current) {
      maskModalResolveRef.current(maskId);
      maskModalResolveRef.current = null;
    }
  };
"""
        content = re.sub(r'const \[photos, setPhotos\] = useState\([\s\S]*?\]\)\);\n', state_str, content)

    # 3. Remove pickMultipleImages completely
    start_multiple = content.find("const pickMultipleImages = async () => {")
    end_multiple = content.find("const pickSingleImage = async (index: number) => {")
    if start_multiple != -1 and end_multiple != -1:
        content = content[:start_multiple] + content[end_multiple:]

    # 4. Rewrite pickSingleImage
    start_single = content.find("const pickSingleImage = async (index: number) => {")
    # Instead of looking for deleteImage, look for the start of `const renderItem`
    end_single = content.find("const renderItem = ({ item, index }: any) => {")
    
    new_pick_single = """const pickSingleImage = async (index: number) => {
    if (isPickerOpenRef.current) return;
    const isAnyLoading = photos.some((p) => p.loading);
    if (isAnyLoading) {
      toastAlert.showToastError("Please wait for the current uploading to finish.");
      return;
    }

    try {
      const permissionResult = await requestGalleryPermission();
      if (!permissionResult.granted) return;

      isPickerOpenRef.current = true;
      if (Platform.OS === "ios" && permissionResult.newlyGranted) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      launchImageLibrary(
        {
          mediaType: "photo",
          selectionLimit: 1,
          quality: 0.8,
          ...(Platform.OS === 'ios' && { presentationStyle: 'pageSheet' })
        },
        async (res: any) => {
          isPickerOpenRef.current = false;
          if (res.didCancel || res.errorCode || res.errorMessage || !res.assets || res.assets.length === 0) {
            return;
          }

          const asset = res.assets[0];
          setPhotos((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], loading: true };
            return updated;
          });

          try {
            const compressedUri = await ImageCompressor.compress(asset.uri, {
              compressionMethod: "auto",
              quality: 0.6,
              maxWidth: 720,
              maxHeight: 1080,
            });

            const formData = new FormData();
            formData.append("image", {
              uri: compressedUri,
              type: asset.type || "image/jpeg",
              name: asset.fileName || `image_${Date.now()}.jpg`,
            } as any);

            const response: any = await dispatch(uploadImagesPhotoAPI(formData));
            
            let imageUrl = "Unsupported";
            let imageId = "";
            let successUpload = false;

            if (response?.statusCode === 200 && response?.data) {
              imageUrl = typeof response.data === 'string' ? response.data : (response.data.url || response.data.image || response.data.fileUrl || "");
              imageId = response.data?._id || response.data?.id || "";
              
              if (response?.data?.success !== false && imageUrl !== "Unsupported") {
                successUpload = true;
              } else {
                setResponseMessage(response?.data?.message || response?.message || "Unsupported image format or size.");
              }
            } else {
               setResponseMessage(response?.message || response?.data?.message || "Unsupported image format or size.");
            }

            setPhotos((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], loading: false, image: imageUrl, imageId };
              return updated;
            });

            if (successUpload && imageUrl !== "Unsupported") {
               // Analyze the compressed image to avoid EXIF rotation issues
               const localUriToAnalyze = compressedUri || asset.uri;
               const analysis = await analyzeFaceForMask(localUriToAnalyze);
               if (analysis) {
                 const maskId = await waitForMaskSelection(asset.uri, analysis);
                 if (maskId) {
                   setPhotos((prev) => {
                     const updated = [...prev];
                     updated[index] = { ...updated[index], maskId };
                     return updated;
                   });
                 }
               }
            }

          } catch (err) {
            console.error("[AddPhotosScreen] Upload failed:", err);
            setPhotos((prev) => {
              const updated = [...prev];
              updated[index] = { ...updated[index], loading: false, image: "Unsupported" };
              return updated;
            });
            setResponseMessage("Compression or upload failed.");
          }
        }
      );
    } catch (e) {
      isPickerOpenRef.current = false;
    }
  };

  const deleteImage = (item: any, index: number) => {
    const updated = [...photos];
    updated[index] = { id: String(index + 1), image: "", imageId: "", loading: false, maskId: null };
    setPhotos(updated);
  };

  """
    if start_single != -1 and end_single != -1:
        content = content[:start_single] + new_pick_single + content[end_single:]

    # 5. Fix renderItem onPress
    render_item_find = 'onPress={() => {\n            if (!item.image || item.image === "Unsupported") {\n              pickMultipleImages();\n            }\n          }}'
    if render_item_find in content:
        content = content.replace(render_item_find, 'onPress={() => {\n            if (!item.image || item.image === "Unsupported") {\n              pickSingleImage(index);\n            }\n          }}')

    # 6. Make sure FaceMaskModal is rendered
    if "<FaceMaskModal" not in content:
        bottom_layer = '{remaining === 0 ?\n        <ImageBackground source={BottomLayer} resizeMode="stretch" style={styles.bottomLayer}>\n          <TouchableOpacity activeOpacity={1} onPress={() => onSubmit()} style={styles.phoneContainer}>\n            <AppText weight={SCHEHERAZADE_BOLD} color={WHITE} type={TWENTY}>\n              Next\n            </AppText>\n          </TouchableOpacity>\n        </ImageBackground> : <></>\n      }'
        replacement = bottom_layer + '\n      {maskModalState.visible && maskModalState.analysis && (\n        <FaceMaskModal\n          visible={maskModalState.visible}\n          imageUri={maskModalState.imageUri}\n          analysis={maskModalState.analysis}\n          onDone={onMaskModalDone}\n        />\n      )}\n'
        content = content.replace(bottom_layer, replacement)

    # 7. Add mask to onSubmit
    if "...(p.maskId ? { mask: p.maskId } : {})" not in content:
        find_gallery = 'const galleryData = uploadedPhotos.map((p, index) => ({\n      priority: index === 0,\n      url: p.image,\n    }));'
        repl_gallery = 'const galleryData = uploadedPhotos.map((p, index) => ({\n      priority: index === 0,\n      url: p.image,\n      ...(p.maskId ? { mask: p.maskId } : {}),\n    }));'
        content = content.replace(find_gallery, repl_gallery)

    with open(filepath, 'w') as f:
        f.write(content)

process()
