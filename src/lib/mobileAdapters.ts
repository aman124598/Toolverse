// Helpers to provide a unified mobile/native API surface.
// When running inside a Capacitor app these use native plugins;
// otherwise they fall back to browser APIs.

export function isCapacitor(): boolean {
  return typeof (globalThis as Record<string, unknown>).Capacitor !== 'undefined';
}

async function blobToBase64(data: Blob | Uint8Array | ArrayBuffer): Promise<string> {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      resolve(parts[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function copyText(text: string): Promise<void> {
  try {
    if (isCapacitor()) {
      const { Clipboard } = await import('@capacitor/clipboard');
      await Clipboard.write({ string: text });
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (e) {
    console.warn('copyText failed', e);
  }
}

export async function storageSet(key: string, value: string): Promise<void> {
  if (isCapacitor()) {
    const { Preferences } = await import('@capacitor/preferences');
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function storageGet(key: string): Promise<string | null> {
  if (isCapacitor()) {
    const { Preferences } = await import('@capacitor/preferences');
    const { value } = await Preferences.get({ key });
    return value ?? null;
  }
  return localStorage.getItem(key);
}

export async function saveFile(data: Blob | Uint8Array | ArrayBuffer, filename: string): Promise<void> {
  try {
    if (isCapacitor()) {
      const base64 = await blobToBase64(data);
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const { Share } = await import('@capacitor/share');
      const path = `${filename}`;
      await Filesystem.writeFile({ path, data: base64, directory: Directory.Documents });
      await Share.share({ title: filename, text: filename, url: path });
      return;
    }

    const blob = data instanceof Blob ? data : new Blob([data as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.warn('saveFile failed', e);
  }
}

export async function openUrl(url: string): Promise<void> {
  if (isCapacitor()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url });
      return;
    } catch (e) {
      // fallback
    }
  }
  window.open(url, '_blank');
}

export default {
  isCapacitor,
  copyText,
  storageSet,
  storageGet,
  saveFile,
  openUrl,
};
