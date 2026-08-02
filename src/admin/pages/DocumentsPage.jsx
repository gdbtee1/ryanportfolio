import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  FileArchive,
  FileText,
  Film,
  LoaderCircle,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import AdminLayout from "../layout/AdminLayout";
import { supabase } from "../../lib/supabase";

const BUCKET_NAME = "portfolio-documents";
const DOCUMENT_FOLDER = "uploads";
const MAX_FILE_SIZE = 250 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "txt",
  "rtf",
  "zip",
  "mp4",
  "mov",
  "m4v",
  "webm",
  "mpeg",
  "mpg",
  "avi",
  "mkv",
  "3gp",
  "3g2",
];

function getExtension(fileName = "") {
  return fileName.includes(".")
    ? fileName.split(".").pop().toLowerCase()
    : "";
}

function isVideoMimeType(mimeType = "") {
  return mimeType.toLowerCase().startsWith("video/");
}

function isKnownVideoExtension(extension = "") {
  return [
    "mp4",
    "mov",
    "m4v",
    "webm",
    "mpeg",
    "mpg",
    "avi",
    "mkv",
    "3gp",
    "3g2",
  ].includes(extension.toLowerCase());
}

function getUploadExtension(file) {
  const existingExtension = getExtension(file.name);

  if (existingExtension) {
    return existingExtension;
  }

  const mimeType = file.type?.toLowerCase() ?? "";

  const mimeExtensionMap = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/x-m4v": "m4v",
    "video/webm": "webm",
    "video/mpeg": "mpeg",
    "video/x-msvideo": "avi",
    "video/x-matroska": "mkv",
    "video/3gpp": "3gp",
    "video/3gpp2": "3g2",
  };

  return mimeExtensionMap[mimeType] ?? "";
}

function sanitizeFileName(file) {
  const extension = getUploadExtension(file);

  const baseName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueSuffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

  return `${baseName || "file"}-${uniqueSuffix}${
    extension ? `.${extension}` : ""
  }`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "Unknown size";
  }

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

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function isVideoFile(fileName, mimeType = "") {
  return (
    isKnownVideoExtension(getExtension(fileName)) ||
    isVideoMimeType(mimeType)
  );
}

function getDocumentType(fileName, mimeType = "") {
  const extension = getExtension(fileName);

  if (extension === "pdf") return "PDF";
  if (extension === "doc" || extension === "docx") return "Word";
  if (extension === "ppt" || extension === "pptx") return "PowerPoint";
  if (extension === "zip") return "Archive";
  if (extension === "txt" || extension === "rtf") return "Text";
  if (isVideoFile(fileName, mimeType)) return "Video";

  return extension.toUpperCase() || "File";
}

function DocumentIcon({ fileName, mimeType = "" }) {
  const extension = getExtension(fileName);

  if (extension === "zip") {
    return <FileArchive size={34} />;
  }

  if (isVideoFile(fileName, mimeType)) {
    return <Film size={34} />;
  }

  return <FileText size={34} />;
}

export default function DocumentsPage() {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [copiedPath, setCopiedPath] = useState("");
  const [deletingPath, setDeletingPath] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(DOCUMENT_FOLDER, {
        limit: 200,
        offset: 0,
        sortBy: {
          column: "created_at",
          order: "desc",
        },
      });

    if (error) {
      console.error("Unable to load files:", error);

      setErrorMessage(error.message || "Unable to load files.");
      setDocuments([]);
      setLoading(false);
      return;
    }

    const loadedDocuments = (data ?? [])
      .filter((file) => file.name && file.id)
      .map((file) => {
        const storagePath = `${DOCUMENT_FOLDER}/${file.name}`;

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(storagePath);

        return {
          ...file,
          storagePath,
          publicUrl: publicUrlData.publicUrl,
          size: file.metadata?.size ?? 0,
          mimeType:
            file.metadata?.mimetype ?? "application/octet-stream",
        };
      });

    setDocuments(loadedDocuments);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return documents;

    return documents.filter((document) => {
      const searchableText = [
        document.name,
        getDocumentType(document.name, document.mimeType),
        document.mimeType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [documents, searchQuery]);

  function validateFile(file) {
    const extension = getExtension(file.name);
    const videoByMime = isVideoMimeType(file.type);
    const videoByExtension = isKnownVideoExtension(extension);

    const isAllowed =
      ALLOWED_EXTENSIONS.includes(extension) ||
      videoByMime ||
      videoByExtension;

    if (!isAllowed) {
      console.error("Rejected upload:", {
        name: file.name,
        mimeType: file.type,
        extension,
        size: file.size,
      });

      return `${file.name} is not a supported file type.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `${file.name} is larger than 250 MB.`;
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

        const fileName = sanitizeFileName(file);
        const storagePath = `${DOCUMENT_FOLDER}/${fileName}`;

        const { error } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(storagePath, file, {
            cacheControl: "3600",
            contentType: file.type || undefined,
            upsert: false,
          });

        if (error) {
          throw error;
        }
      }

      setMessage(
        `${files.length} file${files.length === 1 ? "" : "s"} uploaded successfully.`,
      );

      await loadDocuments();
    } catch (error) {
      console.error("File upload failed:", error);

      setErrorMessage(
        error.message || "Unable to upload the selected files.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function copyPublicUrl(document) {
    try {
      await navigator.clipboard.writeText(document.publicUrl);
      setCopiedPath(document.storagePath);

      window.setTimeout(() => {
        setCopiedPath("");
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
      setErrorMessage("Unable to copy the file URL.");
    }
  }

  async function deleteDocument(document) {
    const confirmed = window.confirm(
      `Delete "${document.name}"?\n\nAny website link using this file will stop working.`,
    );

    if (!confirmed) return;

    setDeletingPath(document.storagePath);
    setMessage("");
    setErrorMessage("");

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([document.storagePath]);

    if (error) {
      console.error("File deletion failed:", error);

      setErrorMessage(error.message || "Unable to delete this file.");
      setDeletingPath("");
      return;
    }

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (currentDocument) =>
          currentDocument.storagePath !== document.storagePath,
      ),
    );

    setMessage("File deleted successfully.");
    setDeletingPath("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragActive(false);
    uploadFiles(event.dataTransfer.files);
  }

  return (
    <AdminLayout>
      <section className="cms-documents-page">
        <header className="cms-page-heading">
          <div>
            <p className="hero-eyebrow">FILE MANAGEMENT</p>

            <h2>Documents</h2>

            <span>
              Upload and manage videos, PDFs, Word documents,
              PowerPoints, text files, and archives.
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
              <UploadCloud size={19} />
            )}

            {uploading ? "Uploading..." : "Upload Files"}
          </button>
        </header>

        <input
          ref={fileInputRef}
          className="cms-hidden-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.rtf,.zip,.mp4,.mov,.m4v,.webm,.mpeg,.mpg,.avi,.mkv,.3gp,.3g2,video/*"
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
          className={`cms-document-dropzone${
            dragActive ? " active" : ""
          }`}
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
            <strong>Drop files here</strong>

            <p>
              Video files, PDF, DOC, DOCX, PPT, PPTX, TXT, RTF, or ZIP —
              maximum 250 MB each.
            </p>
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

        <div className="cms-document-toolbar">
          <div className="cms-toolbar-search">
            <Search size={19} />

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search files..."
            />
          </div>

          <div className="cms-document-toolbar-summary">
            <span>
              {filteredDocuments.length} of {documents.length} files
            </span>

            <button
              type="button"
              className="cms-btn cms-btn-secondary"
              onClick={loadDocuments}
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
          <div className="cms-document-state">
            <LoaderCircle className="cms-spin" size={34} />
            <strong>Loading files...</strong>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="cms-document-state">
            <FileText size={44} />

            <strong>
              {searchQuery
                ? "No matching files"
                : "No files uploaded"}
            </strong>

            <p>
              {searchQuery
                ? "Try another search."
                : "Upload the first file to begin."}
            </p>
          </div>
        ) : (
          <div className="cms-document-list">
            {filteredDocuments.map((document) => (
              <article
                className="cms-document-card"
                key={document.storagePath}
              >
                <div className="cms-document-icon">
                  <DocumentIcon
                    fileName={document.name}
                    mimeType={document.mimeType}
                  />
                </div>

                <div className="cms-document-info">
                  <strong title={document.name}>
                    {document.name}
                  </strong>

                  <div className="cms-document-meta">
                    <span>
                      {getDocumentType(
                        document.name,
                        document.mimeType,
                      )}
                    </span>
                    <span>{formatFileSize(document.size)}</span>
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                </div>

                <div className="cms-document-actions">
                  <a
                    className="cms-btn cms-btn-secondary"
                    href={document.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Download size={16} />
                    Download
                  </a>

                  <button
                    type="button"
                    className="cms-btn cms-btn-secondary"
                    onClick={() => copyPublicUrl(document)}
                  >
                    {copiedPath === document.storagePath ? (
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
                    onClick={() => deleteDocument(document)}
                    disabled={
                      deletingPath === document.storagePath
                    }
                    aria-label={`Delete ${document.name}`}
                  >
                    {deletingPath === document.storagePath ? (
                      <LoaderCircle
                        className="cms-spin"
                        size={17}
                      />
                    ) : (
                      <Trash2 size={17} />
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminLayout>
  );
}