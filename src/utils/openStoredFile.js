import { Linking, Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

function safeFileName(value, contentType) {
  const fallback = contentType === "application/pdf"
    ? "document.pdf"
    : "download";

  const cleaned = String(value || fallback)
    .normalize("NFC")
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);

  if (!cleaned) return fallback;
  if (contentType === "application/pdf" && !/\.pdf$/i.test(cleaned)) {
    return `${cleaned}.pdf`;
  }
  return cleaned;
}

function normalizedFile(fileOrUrl) {
  if (typeof fileOrUrl === "string") {
    return { fileUrl: fileOrUrl };
  }
  return fileOrUrl || {};
}

function fileNameFromUrl(url) {
  try {
    const path = String(url).split("?")[0].split("#")[0];
    return decodeURIComponent(path.split("/").pop() || "");
  } catch {
    return "";
  }
}

function contentTypeFromName(name) {
  const normalized = String(name || "").toLowerCase();
  if (normalized.endsWith(".pdf")) return "application/pdf";
  if (/\.jpe?g$/.test(normalized)) return "image/jpeg";
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".doc")) return "application/msword";
  if (normalized.endsWith(".docx")) return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  return "application/octet-stream";
}

async function safelyDelete(uri) {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Temporary-file cleanup must not hide a successful open action.
  }
}

export async function openStoredFile(fileOrUrl, dialogTitle = "Save file") {
  const file = normalizedFile(fileOrUrl);
  const url = file.fileUrl || file.url;

  if (!url) throw new Error("This file does not have a valid link.");

  if (Platform.OS === "web") {
    const supported = await Linking.canOpenURL(url);
    if (!supported) throw new Error("This file cannot be downloaded on this device.");
    await Linking.openURL(url);
    return;
  }

  if (!FileSystem.cacheDirectory) {
    throw new Error("Temporary file storage is unavailable on this device.");
  }

  const sourceName = file.originalName || file.name || fileNameFromUrl(url);
  const providedType = String(file.contentType || "").toLowerCase();
  const contentType = !providedType || providedType === "application/octet-stream"
    ? contentTypeFromName(sourceName)
    : providedType;
  const fileName = safeFileName(sourceName, contentType);
  const localUri = `${FileSystem.cacheDirectory}${Date.now()}-${fileName}`;

  const result = await FileSystem.downloadAsync(url, localUri);
  if (result.status < 200 || result.status >= 300) {
    await safelyDelete(localUri);
    throw new Error(`The file download failed with status ${result.status}.`);
  }

  if (!await Sharing.isAvailableAsync()) {
    await safelyDelete(localUri);
    throw new Error("Saving files is unavailable on this device.");
  }

  try {
    await Sharing.shareAsync(result.uri, {
      mimeType: contentType,
      UTI: contentType === "application/pdf" ? "com.adobe.pdf" : undefined,
      dialogTitle,
    });
  } finally {
    setTimeout(() => safelyDelete(localUri), 60_000);
  }
}
