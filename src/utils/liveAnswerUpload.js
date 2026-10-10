import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";

export async function pickLiveFile() {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/pdf", "image/jpeg", "image/png"],
    multiple: false, copyToCacheDirectory: true,
  });
  return result.canceled ? null : result.assets?.[0] || null;
}

export async function appendLiveFile(form, field, asset) {
  const mime = asset.mimeType || (/\.pdf$/i.test(asset.name) ? "application/pdf" :
    /\.png$/i.test(asset.name) ? "image/png" : "image/jpeg");
  if (asset.size > 50 * 1024 * 1024) throw new Error("Choose a file smaller than 50 MB.");
  if (Platform.OS === "web") {
    let blob = asset.file;
    if (!(blob instanceof Blob)) {
      const response = await fetch(asset.uri);
      if (!response.ok) throw new Error("Could not read this file. Download it to your device and select it again.");
      blob = await response.blob();
    }
    if (!blob.size) throw new Error("The selected file is empty.");
    form.append(field, blob, asset.name || "answer.pdf");
  } else {
    form.append(field, { uri: asset.uri, name: asset.name || "answer.pdf", type: mime });
  }
}
