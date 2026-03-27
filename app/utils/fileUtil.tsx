import { UploadFile } from "antd";
// const getMediaDuration = (file: File) => {
//   return new Promise((resolve, reject) => {
//     // 1. Basic validation: Ensure it's a file
//     if (!file) {
//       return reject("No file provided");
//     }

//     // 2. Create a temporary URL
//     const url = URL.createObjectURL(file);

//     // 3. Use an Audio object (works for video too for duration)
//     const media = new Audio(url);

//     media.onloadedmetadata = () => {
//       // 4. Cleanup memory and resolve duration
//       URL.revokeObjectURL(url);
//       resolve(media.duration);
//     };

//     media.onerror = () => {
//       URL.revokeObjectURL(url);
//       reject("Error loading media metadata");
//     };
//   });
// };

// // Optional: Helper to format seconds into 00:00 format
// const formatDuration = (totalSeconds: number) => {
//   const seconds = Math.floor(totalSeconds % 60);
//   const minutes = Math.floor(totalSeconds / 60);
//   return `${minutes}:${seconds.toString().padStart(2, "0")}`;
// };
// export const getSecondsFileDuration = async (file: File) => {
//   const duration = await getMediaDuration(file);
//   return formatDuration((duration as number) || 0);
// };

/**
 * Extracts and calculates the duration of an antd UploadFile
 */
export const getSecondsFileDuration = (
  file: UploadFile<any>,
): Promise<number> => {
  return new Promise((resolve, reject) => {
    // 1. Get the raw browser File object from Ant Design's wrapper
    const rawFile = file.originFileObj;

    if (!rawFile) {
      return reject(
        "No originFileObj found. The file might not be fully loaded.",
      );
    }

    // 2. Create a temporary URL for the browser to "read"
    const url = URL.createObjectURL(rawFile);
    const media = new Audio(url);

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(url); // Clean up memory immediately
      resolve(media.duration); // Returns duration in seconds (e.g. 120.5)
    };

    media.onerror = () => {
      URL.revokeObjectURL(url);
      reject("File is not a valid or readable media format.");
    };
  });
};
