import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import api from "../lib/api";
import { getToken } from "../lib/storage";

const MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function exportSessionReport(session) {
  const token = await getToken();
  if (!token) throw new Error("Please sign in again.");
  const title = String(session.title || "Session")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-").slice(0, 90);
  const fileName = `${title} - Attendance and Grades.xlsx`;
  const url = `${api.defaults.baseURL.replace(/\/+$/, "")}/sessions/${encodeURIComponent(session.id)}/report`;
  const headers = { Authorization: `Bearer ${token}`, Accept: MIME };
  if (Platform.OS === "web") {
    const response = await fetch(url, { headers, cache: "no-store" });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.msg || `Export failed (${response.status}).`);
    }
    const objectUrl = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    try {
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
    }
    return;
  }
  if (!FileSystem.cacheDirectory) throw new Error("Temporary file storage is unavailable.");
  if (!(await Sharing.isAvailableAsync())) throw new Error("File sharing is unavailable on this device.");
  const directory = `${FileSystem.cacheDirectory}session-report-${Date.now()}/`;
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
  const fileUri = directory + fileName;
  try {
    const result = await FileSystem.downloadAsync(url, fileUri, { headers });
    if (result.status < 200 || result.status >= 300) {
      let message = `Export failed (${result.status}).`;
      try {
        message = JSON.parse(await FileSystem.readAsStringAsync(fileUri))?.msg || message;
      } catch { /* Use the status message if the response is not JSON. */ }
      throw new Error(message);
    }
    await Sharing.shareAsync(result.uri, {
      mimeType: MIME, UTI: "org.openxmlformats.spreadsheetml.sheet",
      dialogTitle: "Save or share session report",
    });
  } catch (error) {
    await FileSystem.deleteAsync(directory, { idempotent: true }).catch(() => {});
    throw error;
  }
  // The share destination may still be reading this temporary file.
}
