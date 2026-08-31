"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Layers, 
  Package, 
  FolderKanban, 
  Plus, 
  Pencil, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sparkles,
  AlertCircle,
  FileText,
  FileBox
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";

interface Product {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

interface Section {
  id: string;
  name: string;
  description: string | null;
  products: Product[];
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    contextFiles: number;
    blogs: number;
  };
}

interface CompanyDetail {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  sections: Section[];
  projects: Project[];
}

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"sections" | "projects">("sections");

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Company Edit Modal
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [companyDesc, setCompanyDesc] = useState("");

  // Section Modal
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionName, setSectionName] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");

  // Product Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>("");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");

  // Project Modal
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");

  // Generic Deletion Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: "company" | "section" | "product" | "project";
    id: string;
    name: string;
    sectionId?: string;
  }>({
    isOpen: false,
    type: "company",
    id: "",
    name: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCompanyDetails = async () => {
    try {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) {
        if (res.status === 404) router.push("/companies");
        return;
      }
      const data = await res.json();
      setCompany(data);

      // Auto-expand all sections initially
      const initialExpanded: Record<string, boolean> = {};
      data.sections?.forEach((s: Section) => {
        initialExpanded[s.id] = true;
      });
      setExpandedSections(initialExpanded);
    } catch (err) {
      console.error("Error fetching company:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // --- Handlers: Company ---
  const handleEditCompany = () => {
    if (!company) return;
    setCompanyName(company.name);
    setCompanyDesc(company.description || "");
    setFormError("");
    setCompanyModalOpen(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setFormError("Company name is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: companyName, description: companyDesc }),
      });
      if (!res.ok) throw new Error("Failed to update company");
      setCompanyModalOpen(false);
      fetchCompanyDetails();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Section ---
  const openCreateSection = () => {
    setEditingSection(null);
    setSectionName("");
    setSectionDesc("");
    setFormError("");
    setSectionModalOpen(true);
  };

  const openEditSection = (s: Section) => {
    setEditingSection(s);
    setSectionName(s.name);
    setSectionDesc(s.description || "");
    setFormError("");
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      setFormError("Section name is required");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingSection
        ? `/api/sections/${editingSection.id}`
        : `/api/companies/${id}/sections`;
      const method = editingSection ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sectionName, description: sectionDesc }),
      });
      if (!res.ok) throw new Error("Failed to save section");
      setSectionModalOpen(false);
      fetchCompanyDetails();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Product ---
  const openCreateProduct = (sectionId: string) => {
    setTargetSectionId(sectionId);
    setEditingProduct(null);
    setProductName("");
    setProductDesc("");
    setFormError("");
    setProductModalOpen(true);
  };

  const openEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductName(p.name);
    setProductDesc(p.description || "");
    setFormError("");
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim()) {
      setFormError("Product name is required");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : `/api/sections/${targetSectionId}/products`;
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: productName, description: productDesc }),
      });
      if (!res.ok) throw new Error("Failed to save product");
      setProductModalOpen(false);
      fetchCompanyDetails();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handlers: Project ---
  const openCreateProject = () => {
    setEditingProject(null);
    setProjectName("");
    setProjectDesc("");
    setFormError("");
    setProjectModalOpen(true);
  };

  const openEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectName(proj.name);
    setProjectDesc(proj.description || "");
    setFormError("");
    setProjectModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setFormError("Project name is required");
      return;
    }
    setSubmitting(true);
    try {
      const url = editingProject
        ? `/api/projects/${editingProject.id}`
        : `/api/companies/${id}/projects`;
      const method = editingProject ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: projectName, description: projectDesc }),
      });
      if (!res.ok) throw new Error("Failed to save project");
      setProjectModalOpen(false);
      fetchCompanyDetails();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // --- Generic Delete Execution ---
  const handleConfirmDelete = async () => {
    setSubmitting(true);
    try {
      let endpoint = "";
      if (deleteDialog.type === "company") endpoint = `/api/companies/${deleteDialog.id}`;
      if (deleteDialog.type === "section") endpoint = `/api/sections/${deleteDialog.id}`;
      if (deleteDialog.type === "product") endpoint = `/api/products/${deleteDialog.id}`;
      if (deleteDialog.type === "project") endpoint = `/api/projects/${deleteDialog.id}`;

      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete record");

      setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      if (deleteDialog.type === "company") {
        router.push("/companies");
      } else {
        fetchCompanyDetails();
      }
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="space-y-8 pb-12">
      {/* Back link & Company Title Bar */}
      <div>
        <Link
          href="/companies"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Companies
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {company.name}
                </h1>
                <button
                  onClick={handleEditCompany}
                  title="Edit company details"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {company.description || "No company description provided."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              onClick={() =>
                setDeleteDialog({
                  isOpen: true,
                  type: "company",
                  id: company.id,
                  name: company.name,
                })
              }
              className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Company
            </button>
          </div>
        </div>
      </div>

      {/* Tabs: Sections & Products vs Projects */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab("sections")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "sections"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Layers className="h-4 w-4" />
          Sections & Products ({company.sections.length})
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
            activeTab === "projects"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          Projects ({company.projects.length})
        </button>
      </div>

      {/* TAB 1: Sections & Products */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Organizational Sections</h2>
              <p className="text-xs text-slate-500">
                Divisions and product groupings within {company.name}.
              </p>
            </div>
            <button
              onClick={openCreateSection}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Section
            </button>
          </div>

          {company.sections.length > 0 ? (
            <div className="space-y-4">
              {company.sections.map((section) => {
                const isExpanded = expandedSections[section.id] ?? true;
                return (
                  <div
                    key={section.id}
                    className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden transition-all"
                  >
                    {/* Section Header */}
                    <div className="p-5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100">
                      <div
                        className="flex items-center gap-3 cursor-pointer select-none"
                        onClick={() => toggleSection(section.id)}
                      >
                        <button className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                        <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                          <Layers className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">{section.name}</h3>
                            <span className="text-[10px] font-semibold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-full">
                              {section.products.length} Products
                            </span>
                          </div>
                          {section.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openCreateProduct(section.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 text-xs font-semibold shadow-2xs transition-colors cursor-pointer mr-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Product
                        </button>
                        <button
                          onClick={() => openEditSection(section)}
                          title="Edit section"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              type: "section",
                              id: section.id,
                              name: section.name,
                            })
                          }
                          title="Delete section"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Nested Products List */}
                    {isExpanded && (
                      <div className="p-5">
                        {section.products.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {section.products.map((product) => (
                              <div
                                key={product.id}
                                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-sky-600" />
                                      <h4 className="font-bold text-xs text-slate-900">{product.name}</h4>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <button
                                        onClick={() => openEditProduct(product)}
                                        title="Edit product"
                                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setDeleteDialog({
                                            isOpen: true,
                                            type: "product",
                                            id: product.id,
                                            name: product.name,
                                          })
                                        }
                                        title="Delete product"
                                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                                    {product.description || "No product description provided."}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                            No products in this section yet. Click &quot;Add Product&quot; above to create one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Layers className="h-10 w-10 text-slate-400" />}
              title="No sections created"
              description="Sections organize your business departments and contain products."
              action={
                <button
                  onClick={openCreateSection}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Add First Section
                </button>
              }
            />
          )}
        </div>
      )}

      {/* TAB 2: Projects List */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Projects & Campaigns</h2>
              <p className="text-xs text-slate-500">
                Independent content pipelines with isolated context files and blogs.
              </p>
            </div>
            <button
              onClick={openCreateProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Create Project
            </button>
          </div>

          {company.projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {proj.name}
                          </h3>
                          <span className="text-[10px] text-slate-400">
                            Created {new Date(proj.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditProject(proj)}
                          title="Edit project"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteDialog({
                              isOpen: true,
                              type: "project",
                              id: proj.id,
                              name: proj.name,
                            })
                          }
                          title="Delete project"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {proj.description || "No project description provided."}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                      <span className="flex items-center gap-1">
                        <FileBox className="h-3.5 w-3.5 text-emerald-500" />
                        {proj._count.contextFiles} Context Files
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5 text-amber-500" />
                        {proj._count.blogs} Blogs
                      </span>
                    </div>

                    <Link
                      href={`/projects/${proj.id}`}
                      className="font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                    >
                      Open Project <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FolderKanban className="h-10 w-10 text-slate-400" />}
              title="No projects created"
              description="Create a project under this company to start uploading context files and generating blogs."
              action={
                <button
                  onClick={openCreateProject}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs shadow-xs"
                >
                  <Plus className="h-4 w-4" />
                  Create First Project
                </button>
              }
            />
          )}
        </div>
      )}

      {/* --- MODALS --- */}

      {/* Edit Company Modal */}
      <Modal
        isOpen={companyModalOpen}
        onClose={() => setCompanyModalOpen(false)}
        title="Edit Company Details"
      >
        <form onSubmit={handleSaveCompany} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              value={companyDesc}
              onChange={(e) => setCompanyDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCompanyModalOpen(false)}
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

      {/* Section Modal (Create / Edit) */}
      <Modal
        isOpen={sectionModalOpen}
        onClose={() => setSectionModalOpen(false)}
        title={editingSection ? "Edit Section" : "Add New Section"}
        description={`Under company: ${company.name}`}
      >
        <form onSubmit={handleSaveSection} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Section Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. AI & Machine Learning Solutions"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Scope and purpose of this business department..."
              value={sectionDesc}
              onChange={(e) => setSectionDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setSectionModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl"
            >
              {editingSection ? "Update Section" : "Create Section"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Product Modal (Create / Edit) */}
      <Modal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Agent Orchestrator"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description / Capabilities</label>
            <textarea
              rows={3}
              placeholder="Product features, architecture, and value proposition..."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProductModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl"
            >
              {editingProduct ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Modal (Create / Edit) */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={editingProject ? "Edit Project" : "Create New Project"}
        description={`Under company: ${company.name}`}
      >
        <form onSubmit={handleSaveProject} className="space-y-4">
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
              placeholder="e.g. Q3 AI Agents Launch Campaign"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Project Scope / Mission</label>
            <textarea
              rows={3}
              placeholder="Target audience, content objectives, and publishing goals..."
              value={projectDesc}
              onChange={(e) => setProjectDesc(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProjectModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-700 bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-xl"
            >
              {editingProject ? "Update Project" : "Create Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Generic Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteDialog.type.toUpperCase()}`}
        message={`Are you sure you want to delete "${deleteDialog.name}"? This action will cascade delete all nested items.`}
        isLoading={submitting}
      />
    </div>
  );
}
