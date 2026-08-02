import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Search,
  UploadCloud,
  X,
} from "lucide-react";

import { supabase } from "../../../lib/supabase";

const BUCKET_NAME = "portfolio-media";
const MEDIA_FOLDER = "uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
];

function sanitizeFileName(fileName) {
  const extension = fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "image"}-${Date.now()}${
    extension ? `.${extension}` : ""
  }`;
}

export default function MediaPicker({
  open,
  multiple = false,
  selectedUrls = [],
  onSelect,
  onClose,
}) {
  const fileInputRef = useRef(null);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [temporarySelection, setTemporarySelection] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(MEDIA_FOLDER, {
        limit: 300,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error("Unable to load media:", error);
      setErrorMessage(error.message || "Unable to load media.");
      setMediaFiles([]);
      setLoading(false);
      return;
    }

    const files = (data ?? [])
      .filter((file) => file.name && file.id)
      .map((file) => {
        const storagePath = `${MEDIA_FOLDER}/${file.name}`;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        return {
          ...file,
          storagePath,
          publicUrl: publicUrlData.publicUrl,
        };
      });

    setMediaFiles(files);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    setTemporarySelection(
      Array.isArray(selectedUrls) ? selectedUrls.filter(Boolean) : [],
    );

    setSearchQuery("");
    setErrorMessage("");
    loadMedia();
  }, [open, selectedUrls, loadMedia]);

  useEffect(() => {
    if (!open) return undefined;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  const filteredMedia = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return mediaFiles;

    return mediaFiles.filter((file) =>
      file.name.toLowerCase().includes(query),
    );
  }, [mediaFiles, searchQuery]);

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name} is not a supported image type.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 10 MB.`;
    }

    return "";
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList ?? []);

    if (!files.length || uploading) return;

    setUploading(true);
    setErrorMessage("");

    try {
      const uploadedUrls = [];

      for (const file of files) {
        const validationError = validateFile(file);

        if (validationError) {
          throw new Error(validationError);
        }

        const fileName = sanitizeFileName(file.name);
        const storagePath = `${MEDIA_FOLDER}/${fileName}`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type,
            upsert: false,
          });

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        uploadedUrls.push(publicUrlData.publicUrl);
      }

      await loadMedia();

      if (multiple) {
        setTemporarySelection((current) => [
          ...new Set([...current, ...uploadedUrls]),
        ]);
      } else if (uploadedUrls[0]) {
        setTemporarySelection([uploadedUrls[0]]);
      }
    } catch (error) {
      console.error("Media upload failed:", error);

      setErrorMessage(
        error.message || "Unable to upload the selected images.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function toggleImage(url) {
    if (!multiple) {
      setTemporarySelection([url]);
      return;
    }

    setTemporarySelection((current) => {
      if (current.includes(url)) {
        return current.filter((selectedUrl) => selectedUrl !== url);
      }

      return [...current, url];
    });
  }

  function confirmSelection() {
    if (multiple) {
      onSelect?.(temporarySelection);
    } else {
      onSelect?.(temporarySelection[0] ?? "");
    }

    onClose?.();
  }

  if (!open) return null;

  return (
    <div
      className="cms-media-picker-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="cms-media-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
      >
        <header className="cms-media-picker-header">
          <div>
            <p className="hero-eyebrow">MEDIA LIBRARY</p>

            <h2 id="media-picker-title">
              {multiple ? "Choose Gallery Images" : "Choose Cover Image"}
            </h2>

            <span>
              {multiple
                ? "Select one or more uploaded images."
                : "Select one image for the project cover."}
            </span>
          </div>

          <button
            type="button"
            className="cms-media-picker-close"
            onClick={onClose}
            aria-label="Close media picker"
          >
            <X size={22} />
          </button>
        </header>

        <div className="cms-media-picker-toolbar">
          <div className="cms-toolbar-search">
            <Search size={18} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search uploaded images..."
            />
          </div>

          <div className="cms-media-picker-toolbar-actions">
            <input
              ref={fileInputRef}
              className="cms-hidden-input"
              type="file"
              accept={ALLOWED_TYPES.join(",")}
              multiple={multiple}
              onChange={(event) => uploadFiles(event.target.files)}
            />

            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={loadMedia}
              disabled={loading || uploading}
            >
              <RefreshCw
                size={17}
                className={loading ? "cms-spin" : ""}
              />
              Refresh
            </button>

            <button
              type="button"
              className="cms-btn cms-btn-primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <LoaderCircle className="cms-spin" size={18} />
              ) : (
                <UploadCloud size={18} />
              )}

              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="cms-alert cms-alert-error" role="alert">
            {errorMessage}
          </div>
        )}

        <div className="cms-media-picker-content">
          {loading ? (
            <div className="cms-media-picker-state">
              <LoaderCircle className="cms-spin" size={36} />
              <strong>Loading media...</strong>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="cms-media-picker-state">
              <ImagePlus size={44} />
              <strong>No images found</strong>
              <p>Upload an image or try another search.</p>
            </div>
          ) : (
            <div className="cms-media-picker-grid">
              {filteredMedia.map((file) => {
                const selected = temporarySelection.includes(
                  file.publicUrl,
                );

                return (
                  <button
                    type="button"
                    className={`cms-media-picker-card${
                      selected ? " selected" : ""
                    }`}
                    key={file.storagePath}
                    onClick={() => toggleImage(file.publicUrl)}
                  >
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      loading="lazy"
                    />

                    <span className="cms-media-picker-card-name">
                      {file.name}
                    </span>

                    {selected && (
                      <span className="cms-media-picker-check">
                        <Check size={17} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <footer className="cms-media-picker-footer">
          <span>
            {temporarySelection.length} image
            {temporarySelection.length === 1 ? "" : "s"} selected
          </span>

          <div>
            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="button"
              className="cms-btn cms-btn-primary"
              onClick={confirmSelection}
              disabled={temporarySelection.length === 0}
            >
              <Check size={18} />
              Use Selected
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}