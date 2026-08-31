"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FolderKanban, 
  Building2, 
  FileText, 
  FileBox, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  ExternalLink,
  Sparkles,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Share2,
  UploadCloud,
  Eye,
  FileSpreadsheet,
  File,
  Copy,
  Check
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface ContextFile {
  id: string;
  fileName: string;
  fileType: string;
  filePath: string | null;
  extractedContent: string;
  createdAt: string;
}

interface PublishedPost {
  id: string;
  platform: string;
  status: string;
  url: string | null;
}

interface Blog {
  id: string;
  title: string;
  topic: string | null;
  status: string;
  content: string;
  createdAt: string;
  publishedPosts: PublishedPost[];
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  company: {
    id: string;
    name: string;
    sections: Array<{
      id: string;
      name: string;
      products: Array<{ id: string; name: string }>;
    }>;
  };
  contextFiles: ContextFile[];
  blogs: Blog[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"context" | "blogs">("context");

  // Project Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Context Ingestion Modal State
  const [contextModalOpen, setContextModalOpen] = useState(false);
  const [contextMode, setContextMode] = useState<"upload" | "note">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [uploadingContext, setUploadingContext] = useState(false);
  const [contextError, setContextError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Context Preview Modal State
  const [previewFile, setPreviewFile] = useState<ContextFile | null>(null);
  const [copied, setCopied] = useState(false);

  // Delete Context File Dialog
  const [fileToDelete, setFileToDelete] = useState<ContextFile | null>(null);
  const [deletingFile, setDeletingFile] = useState(false);

  // Delete Project Dialog
  const [deleteProjectDialogOpen, setDeleteProjectDialogOpen] = useState(false);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/projects");
        return;
      }
      const data = await res.json();
      setProject(data);
    } catch (err) {
      console.error("Error fetching project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEdit = () => {
    if (!project) return;
    setName(project.name);
    setDescription(project.description || "");
    setFormError("");
    setEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Project name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error("Failed to update project");
      setEditModalOpen(false);
      fetchProject();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete project");
      router.push("/projects");
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Context Ingestion Handlers ---
  const openContextModal = () => {
    setSelectedFile(null);
    setNoteTitle("");
    setNoteContent("");
    setContextError("");
    setContextMode("upload");
    setContextModalOpen(true);
  };

  const handleContextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContextError("");
    setUploadingContext(true);

    try {
      if (contextMode === "upload") {
        if (!selectedFile) {
          throw new Error("Please select a file to upload (.pdf, .md, .txt)");
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        const res = await fetch(`/api/projects/${id}/context-files`, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to process context file");
      } else {
        if (!noteTitle.trim() || !noteContent.trim()) {
          throw new Error("Please provide both a title and note content.");
        }

        const res = await fetch(`/api/projects/${id}/context-files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: noteTitle, content: noteContent }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to save direct note");
      }

      setContextModalOpen(false);
      fetchProject();
    } catch (err: any) {
      setContextError(err.message || "Failed to save context");
    } finally {
      setUploadingContext(false);
    }
  };

  const handleDeleteContextFile = async () => {
    if (!fileToDelete) return;
    setDeletingFile(true);
    try {
      const res = await fetch(`/api/context-files/${fileToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete context file");
      setFileToDelete(null);
      fetchProject();
    } catch (err) {
      console.error("Delete file failed:", err);
    } finally {
      setDeletingFile(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (fileType: string, fileName: string) => {
    const name = fileName.toLowerCase();
    if (fileType.includes("pdf") || name.endsWith(".pdf")) {
      return <FileText className="h-5 w-5 text-rose-500" />;
    }
    if (name.endsWith(".md") || name.endsWith(".markdown")) {
      return <FileCode className="h-5 w-5 text-indigo-500" />;
    }
    return <File className="h-5 w-5 text-emerald-500" />;
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Back Link & Project Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0 shadow-xs">
              <FolderKanban className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/companies/${project.company.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-0.5 rounded-md transition-colors"
                >
                  <Building2 className="h-3 w-3" />
                  {project.company.name}
                </Link>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <button
                  onClick={handleEdit}
                  title="Edit project details"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {project.description || "No project description provided."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() => setDeleteProjectDialogOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Project
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Context Files vs Blogs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("context")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "context"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileBox className="h-4 w-4" />
          Project Context Files ({project.contextFiles.length})
        </button>
        <button
          onClick={() => setActiveTab("blogs")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "blogs"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="h-4 w-4" />
          Blogs ({project.blogs.length})
        </button>
      </div>

      {/* TAB 1: Context Files */}
      {activeTab === "context" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Context Documents</h2>
              <p className="text-xs text-slate-500">
                Extracted guidelines, research whitepapers, and specs used to ground Gemini AI during blog generation.
              </p>
            </div>
            <button
              onClick={openContextModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UploadCloud className="h-4 w-4" />
              Add Context Document
            </button>
          </div>

          {project.contextFiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.contextFiles.map((file) => {
                const words = file.extractedContent.split(/\s+/).filter(Boolean).length;
                return (
                  <div
                    key={file.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {getFileIcon(file.fileType, file.fileName)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                              {file.fileName}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span>{file.fileType}</span>
                              <span>•</span>
                              <span>{words} words</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setPreviewFile(file)}
                            title="Preview extracted content"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setFileToDelete(file)}
                            title="Delete context file"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content snippet */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-mono text-slate-700 line-clamp-3 leading-relaxed whitespace-pre-wrap">
                        {file.extractedContent}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Ingested: {new Date(file.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="font-bold text-indigo-600 hover:underline cursor-pointer"
                      >
                        View Full Text
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<FileBox className="h-10 w-10 text-slate-400" />}
              title="No context documents attached"
              description="Upload PDF documents, Markdown guides, or plain text notes to ground the AI in your company knowledge."
              action={
                <button
                  onClick={openContextModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-md shadow-indigo-200"
                >
                  <UploadCloud className="h-4 w-4" />
                  Add First Context Document
                </button>
              }
            />
          )}
        </div>
      )}

      {/* TAB 2: Blogs */}
      {activeTab === "blogs" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Project Blogs</h2>
              <p className="text-xs text-slate-500">
                AI-generated and approved blogs within this project campaign.
              </p>
            </div>
          </div>

          {project.blogs.length > 0 ? (
            <div className="space-y-4">
              {project.blogs.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant={b.status.toLowerCase() as any}>{b.status}</Badge>
                        {b.topic && (
                          <span className="text-xs font-medium text-slate-500">
                            Topic: {b.topic}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {b.content.slice(0, 280)}...
                  </p>

                  {/* Syndication Links */}
                  {b.publishedPosts.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs">
                      <span className="font-semibold text-slate-500 flex items-center gap-1">
                        <Share2 className="h-3.5 w-3.5 text-teal-600" />
                        Syndication:
                      </span>
                      {b.publishedPosts.map((post, pIdx) => (
                        <span key={pIdx} className="inline-flex items-center gap-1 text-slate-600">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="font-medium">{post.platform}</span>
                          <span className="text-[10px] text-slate-400">({post.status})</span>
                          {post.url && (
                            <a
                              href={post.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline inline-flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 ml-0.5" />
                            </a>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FileText className="h-10 w-10 text-slate-400" />}
              title="No blogs generated yet"
              description="Upload context documents, then generate AI blogs in Phase 4."
            />
          )}
        </div>
      )}

      {/* --- MODAL 1: ADD CONTEXT MODAL --- */}
      <Modal
        isOpen={contextModalOpen}
        onClose={() => setContextModalOpen(false)}
        title="Add Project Context"
        description={`Attach reference context strictly to "${project.name}"`}
      >
        <div className="space-y-4">
          {/* Mode Switcher */}
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setContextMode("upload")}
              className={`py-2 rounded-lg transition-all ${
                contextMode === "upload"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📄 Upload File (PDF, MD, TXT)
            </button>
            <button
              type="button"
              onClick={() => setContextMode("note")}
              className={`py-2 rounded-lg transition-all ${
                contextMode === "note"
                  ? "bg-white text-indigo-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ✍️ Direct Note / Guideline
            </button>
          </div>

          <form onSubmit={handleContextSubmit} className="space-y-4">
            {contextError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {contextError}
              </div>
            )}

            {contextMode === "upload" ? (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-6 text-center bg-indigo-50/30 hover:bg-indigo-50/60 transition-all cursor-pointer space-y-2"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.md,.markdown,.txt,.json,.csv"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="h-12 w-12 rounded-xl bg-white text-indigo-600 mx-auto flex items-center justify-center shadow-xs">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {selectedFile ? selectedFile.name : "Click to browse or drop file here"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Supports PDF, Markdown (.md), Plain Text (.txt) up to 10MB
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                      <Check className="h-3.5 w-3.5" /> Ready for extraction ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Note / Guideline Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Brand Tone of Voice or Technical Specifications"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Context Content *
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste brand rules, technical architecture notes, or previous sample blog posts..."
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setContextModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingContext || (contextMode === "upload" && !selectedFile)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {uploadingContext ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Extracting & Saving...
                  </>
                ) : (
                  "Ingest Context"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* --- MODAL 2: VIEW EXTRACTED TEXT MODAL --- */}
      <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.fileName || "Context Document Preview"}
        description={`Type: ${previewFile?.fileType} • Ingested ${previewFile ? new Date(previewFile.createdAt).toLocaleDateString() : ""}`}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Extracted Content ({previewFile?.extractedContent.split(/\s+/).filter(Boolean).length} words)
            </span>
            <button
              onClick={() => previewFile && copyToClipboard(previewFile.extractedContent)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy Text"}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs max-h-96 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {previewFile?.extractedContent}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => setPreviewFile(null)}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* --- MODAL 3: EDIT PROJECT MODAL --- */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Project Details"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Scope / Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Project Dialog */}
      <ConfirmDialog
        isOpen={deleteProjectDialogOpen}
        onClose={() => setDeleteProjectDialogOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All associated context files and blogs will be permanently deleted.`}
        isLoading={submitting}
      />

      {/* Delete Context File Dialog */}
      <ConfirmDialog
        isOpen={!!fileToDelete}
        onClose={() => setFileToDelete(null)}
        onConfirm={handleDeleteContextFile}
        title="Delete Context Document"
        message={`Are you sure you want to delete "${fileToDelete?.fileName}"? This document will no longer be used as context for future blog generations.`}
        isLoading={deletingFile}
      />
    </div>
  );
}
