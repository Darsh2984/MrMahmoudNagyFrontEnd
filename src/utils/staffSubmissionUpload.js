import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import api from "../lib/api";

const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/*",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

function createClientId(index) {
  return `staff-homework-${Date.now()}-${index}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

async function readWebBody(asset) {
  const declaredSize = Number(asset.file?.size ?? asset.size);
  if (Number.isFinite(declaredSize) && declaredSize > MAX_FILE_SIZE) {
    throw new Error(`"${asset.name || "This file"}" is larger than 50 MB.`);
  }

  try {
    const bytes = asset.file?.arrayBuffer
      ? await asset.file.arrayBuffer()
      : await (await fetch(asset.uri)).arrayBuffer();

    if (!bytes.byteLength) {
      throw new Error("EMPTY_FILE");
    }
    if (bytes.byteLength > MAX_FILE_SIZE) {
      throw new Error("FILE_TOO_LARGE");
    }
    return bytes;
  } catch (error) {
    if (error?.message === "FILE_TOO_LARGE") {
      throw new Error(`"${asset.name || "This file"}" is larger than 50 MB.`);
    }
    throw new Error(
      `Could not read "${asset.name || "this file"}". If it is stored in Google Drive, open it there first or save a copy to this device.`,
    );
  }
}

async function uploadToStorage(asset, prepared, webBody) {
  const contentType =
    prepared.contentType || asset.mimeType || "application/octet-stream";

  if (Platform.OS !== "web") {
    const result = await FileSystem.createUploadTask(
      prepared.uploadUrl,
      asset.uri,
      {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: { "Content-Type": contentType },
      },
    ).uploadAsync();

    if (!result || result.status < 200 || result.status >= 300) {
      throw new Error(`Storage upload failed with status ${result?.status || "unknown"}.`);
    }
    return;
  }

  await new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("PUT", prepared.uploadUrl);
    request.timeout = 0;
    request.setRequestHeader("Content-Type", contentType);
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        resolve();
      } else {
        reject(new Error(`Storage upload failed with status ${request.status}.`));
      }
    };
    request.onerror = () => reject(
      new Error("The file could not reach storage. Try another connection or browser."),
    );
    request.send(webBody);
  });
}

export async function selectAndUploadForStudent({ taskId, studentId }) {
  const selection = await DocumentPicker.getDocumentAsync({
    type: ACCEPTED_TYPES,
    multiple: true,
    copyToCacheDirectory: true,
  });

  if (selection.canceled || !selection.assets?.length) {
    return { cancelled: true, count: 0 };
  }

  if (selection.assets.length > MAX_FILES) {
    throw new Error(`Select a maximum of ${MAX_FILES} files.`);
  }

  const files = await Promise.all(
    selection.assets.map(async (asset, index) => {
      const webBody = Platform.OS === "web" ? await readWebBody(asset) : null;
      const size = Number(webBody?.byteLength ?? asset.size);

      if (Number.isFinite(size) && size > MAX_FILE_SIZE) {
        throw new Error(`"${asset.name || "This file"}" is larger than 50 MB.`);
      }

      return {
        asset,
        webBody,
        clientId: createClientId(index),
        name: asset.name || `Student file ${index + 1}`,
        contentType:
          asset.mimeType || asset.file?.type || "application/octet-stream",
        size,
      };
    }),
  );

  const basePath = `/submissions/task/${taskId}/student/${studentId}/uploads`;
  let prepared = [];

  try {
    const response = await api.post(`${basePath}/prepare`, {
      files: files.map(({ clientId, name, contentType, size }) => ({
        clientId,
        name,
        contentType,
        size,
      })),
    });

    prepared = response.data?.uploads || [];
    if (prepared.length !== files.length) {
      throw new Error("The server did not prepare all selected files.");
    }

    const confirmedUploads = [];
    for (const file of files) {
      const upload = prepared.find((item) => item.clientId === file.clientId);
      if (!upload?.uploadUrl || !upload?.objectKey) {
        throw new Error(`The server did not prepare "${file.name}".`);
      }

      await uploadToStorage(file.asset, upload, file.webBody);
      confirmedUploads.push({
        clientId: file.clientId,
        objectKey: upload.objectKey,
      });
    }

    await api.post(`${basePath}/confirm`, { uploads: confirmedUploads });
    return { cancelled: false, count: confirmedUploads.length };
  } catch (error) {
    const objectKeys = prepared.map((item) => item.objectKey).filter(Boolean);
    if (objectKeys.length) {
      api.post(`${basePath}/abort`, { objectKeys }).catch(() => {});
    }
    throw error;
  }
}
