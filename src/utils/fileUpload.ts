export const fileToDataUrl = (
  file: File,
  maxBytes: number,
  allowedPrefix: 'image/' | 'video/'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith(allowedPrefix)) {
      reject(new Error(`Formato inválido. Esperado ${allowedPrefix}*`));
      return;
    }
    if (file.size > maxBytes) {
      reject(new Error(`Arquivo excede ${(maxBytes / (1024 * 1024)).toFixed(1)}MB`));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};
