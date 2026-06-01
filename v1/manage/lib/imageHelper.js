import toast from "react-hot-toast";

/**
 * Compresses an image client-side and converts HEIC to JPEG.
 * @param {File} file The original file uploaded by the user.
 * @returns {Promise<File>} A promise that resolves to the compressed/converted File object.
 */
export async function processImageForUpload(file) {
  if (!file) return null;

  const fileName = file.name || "image.jpg";
  const fileExt = fileName.split(".").pop().toLowerCase();
  const isHeic = fileExt === "heic" || fileExt === "heif" || file.type === "image/heic" || file.type === "image/heif";

  let workingBlob = file;

  // 1. Handle HEIC / HEIF Conversion
  if (isHeic) {
    try {
      toast.loading("Converting HEIC photo format...", { id: "image-process" });
      const heic2any = (await import("heic2any")).default;
      const converted = await heic2any({
        blob: file,
        toType: "image/jpeg",
        quality: 0.8
      });
      workingBlob = Array.isArray(converted) ? converted[0] : converted;
      toast.success("Format converted successfully!", { id: "image-process" });
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      toast.error("Failed to convert HEIC format. Please use JPEG or PNG.", { id: "image-process" });
      throw new Error("HEIC conversion failed");
    }
  }

  // 2. Perform Client-side Compression & Resizing using Canvas
  return new Promise((resolve, reject) => {
    // We only compress standard image types
    const validImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validImageTypes.includes(workingBlob.type) && !isHeic) {
      // If it's not a standard image format, return it as is or let it fail on server
      resolve(file);
      return;
    }

    toast.loading("Optimizing photo size...", { id: "image-process" });

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions (max 1600px width/height)
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        // Draw image onto canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG at 0.8 quality
        canvas.toBlob(
          (compressedBlob) => {
            if (!compressedBlob) {
              toast.error("Optimization failed.", { id: "image-process" });
              reject(new Error("Canvas toBlob returned null"));
              return;
            }

            // Create a new file from the compressed blob
            const newFileName = isHeic ? fileName.replace(/\.(heic|heif)$/i, ".jpg") : fileName;
            const compressedFile = new File([compressedBlob], newFileName, {
              type: "image/jpeg",
              lastModified: Date.now()
            });

            toast.success("Ready to upload!", { id: "image-process" });
            resolve(compressedFile);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => {
        toast.error("Failed to load image for processing.", { id: "image-process" });
        reject(new Error("Failed to load image"));
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      toast.error("Failed to read image file.", { id: "image-process" });
      reject(new Error("Failed to read file"));
    };
    reader.readAsDataURL(workingBlob);
  });
}
