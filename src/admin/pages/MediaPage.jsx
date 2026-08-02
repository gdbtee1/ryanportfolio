import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  FileImage,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import AdminLayout from "../layout/AdminLayout";
import { supabase } from "../../lib/supabase";

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

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "Unknown date";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function MediaPage() {
  const fileInputRef = useRef(null);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedPath, setCopiedPath] = useState("");
  const [deletingPath, setDeletingPath] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadMedia = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(MEDIA_FOLDER, {
        limit: 200,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error("Unable to load media:", error);
      setErrorMessage(error.message || "Unable to load media files.");
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
          size: file.metadata?.size ?? 0,
          mimeType: file.metadata?.mimetype ?? "image",
        };
      });

    setMediaFiles(files);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  const filteredFiles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) return mediaFiles;

    return mediaFiles.filter((file) =>
      file.name.toLowerCase().includes(normalizedQuery),
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
    setMessage("");
    setErrorMessage("");

    try {
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

        if (error) throw error;
      }

      setMessage(
        `${files.length} image${files.length === 1 ? "" : "s"} uploaded successfully.`,
      );

      await loadMedia();
    } catch (error) {
      console.error("Media upload failed:", error);
      setErrorMessage(error.message || "Unable to upload the selected files.");
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function copyPublicUrl(file) {
    try {
      await navigator.clipboard.writeText(file.publicUrl);
      setCopiedPath(file.storagePath);

      window.setTimeout(() => {
        setCopiedPath("");
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      setErrorMessage("Unable to copy the image URL.");
    }
  }

  async function deleteFile(file) {
    const confirmed = window.confirm(
      `Delete "${file.name}"?\n\nAny project using this image may stop displaying it.`,
    );

    if (!confirmed) return;

    setDeletingPath(file.storagePath);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([file.storagePath]);

    if (error) {
      console.error("Media deletion failed:", error);
      setErrorMessage(error.message || "Unable to delete this image.");
      setDeletingPath("");
      return;
    }

    setMediaFiles((currentFiles) =>
      currentFiles.filter(
        (currentFile) => currentFile.storagePath !== file.storagePath,
      ),
    );

    setMessage("Image deleted successfully.");
    setDeletingPath("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    uploadFiles(event.dataTransfer.files);
  }

  return (
    <AdminLayout>
      <section className="cms-media-page">
        <header className="cms-page-heading">
          <div>
            <p className="hero-eyebrow">ASSET MANAGEMENT</p>
            <h2>Media Library</h2>
            <span>
              Upload and manage the images used across the portfolio.
            </span>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <LoaderCircle className="cms-spin" size={19} />
            ) : (
              <ImagePlus size={19} />
            )}

            {uploading ? "Uploading..." : "Upload Images"}
          </button>
        </header>

        <input
          ref={fileInputRef}
          className="cms-hidden-input"
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          multiple
          onChange={(event) => uploadFiles(event.target.files)}
        />

        {errorMessage && (
          <div className="cms-alert cms-alert-error">
            <span>{errorMessage}</span>

            <button
              type="button"
              onClick={() => setErrorMessage("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {message && (
          <div className="cms-alert cms-alert-success">
            <Check size={18} />
            <span>{message}</span>
          </div>
        )}

        <div
          className={`cms-media-dropzone${dragActive ? " active" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();

            if (event.currentTarget === event.target) {
              setDragActive(false);
            }
          }}
          onDrop={handleDrop}
        >
          <UploadCloud size={38} />

          <div>
            <strong>Drop images here</strong>
            <p>JPG, PNG, WebP, GIF or SVG — maximum 10 MB each.</p>
          </div>

          <button
            type="button"
            className="cms-btn cms-btn-secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            Browse Files
          </button>
        </div>

        <div className="cms-media-toolbar">
          <div className="cms-toolbar-search">
            <Search size={19} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search uploaded images..."
            />
          </div>

          <div className="cms-media-toolbar-summary">
            <span>
              {filteredFiles.length} of {mediaFiles.length} images
            </span>

            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={loadMedia}
              disabled={loading}
            >
              <RefreshCw
                className={loading ? "cms-spin" : ""}
                size={18}
              />

              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="cms-media-state">
            <LoaderCircle className="cms-spin" size={34} />
            <strong>Loading media...</strong>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="cms-media-state">
            <FileImage size={44} />

            <strong>
              {searchQuery ? "No matching images" : "No images uploaded"}
            </strong>

            <p>
              {searchQuery
                ? "Try another search."
                : "Upload the first portfolio image to begin."}
            </p>
          </div>
        ) : (
          <div className="cms-media-grid">
            {filteredFiles.map((file) => (
              <article className="cms-media-card" key={file.storagePath}>
                <div className="cms-media-preview">
                  <img
                    src={file.publicUrl}
                    alt={file.name}
                    loading="lazy"
                  />
                </div>

                <div className="cms-media-card-body">
                  <strong title={file.name}>{file.name}</strong>

                  <div className="cms-media-meta">
                    <span>{formatFileSize(file.size)}</span>
                    <span>{formatDate(file.created_at)}</span>
                  </div>

                  <div className="cms-media-actions">
                    <button
                      type="button"
                      className="cms-btn cms-btn-secondary"
                      onClick={() => copyPublicUrl(file)}
                    >
                      {copiedPath === file.storagePath ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Clipboard size={16} />
                          Copy URL
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() => deleteFile(file)}
                      disabled={deletingPath === file.storagePath}
                      aria-label={`Delete ${file.name}`}
                    >
                      {deletingPath === file.storagePath ? (
                        <LoaderCircle className="cms-spin" size={17} />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}