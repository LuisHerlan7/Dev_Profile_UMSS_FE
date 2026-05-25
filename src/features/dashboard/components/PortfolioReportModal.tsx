import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, Image as ImageIcon, X } from 'lucide-react';
import {
  buildSettingsProfile,
  mapExperienciaYFormacion,
  mapHabilidades,
  mapProyectosToProjectItems,
} from '@features/dashboard/utils/developerDashboardMappers';
import type { DeveloperDashboardPayload } from '@features/dashboard/api/developerDashboard';
import { recordReportExport } from '@features/dashboard/api/developerDashboard';
import { useI18n } from '@shared/i18n/I18nProvider';

type PortfolioReportModalProps = {
  open: boolean;
  onClose: () => void;
  dashboardData: DeveloperDashboardPayload | null;
};

type ReportFormat = 'pdf' | 'word';

type ReportProfile = {
  name: string;
  role: string;
  summary: string;
  contactEmail: string;
  phone: string;
  github: string;
  linkedin: string;
  website: string;
  titleHierarchy: string[];
  roleHierarchy: string[];
  technicalSkills: Array<{ id: string; name: string; level: string; progress: number }>;
  softSkills: Array<{ id: string; name: string; level: string; progress: number }>;
  projects: Array<{ id: string; title: string; subtitle: string; tags: string[]; status: string }>;
  records: Array<{ id: string; title: string; description: string; footer: string; recordType: string }>;
  avatarUrl: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function buildDocumentShell(title: string, body: string) {
  return `<!DOCTYPE html>
  <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
      <style>
        @page { size: A4; margin: 18mm; }
        body { margin: 0; padding: 0; background: #edf3ff; color: #162033; font-family: Arial, Helvetica, sans-serif; }
        .doc-page { max-width: 900px; margin: 0 auto; padding: 28px 20px; }
        .doc-sheet { background: #ffffff; border: 1px solid #dbe5ff; border-radius: 28px; overflow: hidden; box-shadow: 0 24px 52px rgba(26,35,66,0.12); }
        .doc-ribbon { height: 16px; background: linear-gradient(90deg, #5b63ff 0%, #5048e5 42%, #08a5e8 100%); }
        .doc-header { padding: 28px; background: linear-gradient(135deg, #f8faff 0%, #eef3ff 100%); }
        .doc-hero { width: 100%; border-spacing: 0; }
        .doc-avatar-cell { width: 158px; vertical-align: top; padding-right: 20px; }
        .doc-avatar { width: 132px; height: 132px; border-radius: 28px; overflow: hidden; background: linear-gradient(135deg, #5048e5, #6c63ff); text-align: center; line-height: 132px; color: #fff; font-size: 42px; font-weight: 800; box-shadow: 0 16px 32px rgba(80,72,229,0.25); }
        .doc-avatar img { width: 132px; height: 132px; object-fit: cover; display: block; }
        .doc-pill { display: inline-block; padding: 7px 12px; border-radius: 999px; background: #eef2ff; color: #4f46e5; border: 1px solid #d8defe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.14em; }
        .doc-name { margin: 16px 0 6px; font-size: 35px; font-weight: 800; color: #0f172a; line-height: 1.1; }
        .doc-role { margin: 0; font-size: 18px; font-weight: 700; color: #42526d; }
        .doc-summary { margin: 14px 0 0; font-size: 14px; line-height: 1.75; color: #4b5563; }
        .doc-main { padding: 28px; }
        .doc-grid { width: 100%; border-spacing: 0; margin-bottom: 22px; }
        .doc-grid td { width: 50%; vertical-align: top; }
        .doc-grid td:first-child { padding-right: 10px; }
        .doc-grid td:last-child { padding-left: 10px; }
        .doc-card { border: 1px solid #e1e8ff; border-radius: 22px; background: #f9fbff; padding: 18px; }
        .doc-card-title { margin: 0 0 10px; font-size: 14px; font-weight: 800; color: #0f172a; }
        .doc-meta { margin: 7px 0 0; font-size: 13px; line-height: 1.6; color: #475569; }
        .doc-section { margin-top: 24px; }
        .doc-section-title { margin: 0 0 14px; font-size: 20px; font-weight: 800; color: #0f172a; }
        .doc-tags { margin-top: 12px; }
        .doc-tag { display: inline-block; margin: 0 8px 8px 0; padding: 7px 11px; border-radius: 999px; background: #eef2ff; border: 1px solid #d9e3ff; color: #3730a3; font-size: 12px; font-weight: 700; }
        .doc-skills { width: 100%; border-spacing: 0; }
        .doc-skills td { width: 50%; vertical-align: top; padding: 0 8px 12px 0; }
        .doc-skill { border: 1px solid #e3e9ff; border-radius: 18px; padding: 16px; background: #fff; }
        .doc-skill-name { font-size: 15px; font-weight: 800; color: #0f172a; }
        .doc-skill-meta { margin-top: 8px; font-size: 12px; color: #64748b; }
        .doc-skill-progress { float: right; font-weight: 700; color: #4f46e5; }
        .doc-bar { margin-top: 10px; height: 10px; border-radius: 999px; background: #e5eafc; overflow: hidden; }
        .doc-bar-fill { height: 10px; border-radius: 999px; background: linear-gradient(90deg, #5b63ff 0%, #5048e5 42%, #08a5e8 100%); }
        .doc-list { margin-top: 4px; }
        .doc-item { border: 1px solid #e2e8ff; border-radius: 18px; background: #fff; padding: 16px; margin-bottom: 12px; }
        .doc-item-label { display: inline-block; padding: 5px 9px; border-radius: 999px; background: #eef2ff; color: #4f46e5; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
        .doc-item-title { margin: 10px 0 6px; font-size: 16px; font-weight: 800; color: #0f172a; }
        .doc-item-subtitle { margin: 0; font-size: 13px; color: #64748b; }
        .doc-item-text { margin: 10px 0 0; font-size: 13px; line-height: 1.65; color: #475569; }
        .doc-footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e3e8f8; font-size: 12px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="doc-page">${body}</div>
    </body>
  </html>`;
}

function buildMarkup(profile: ReportProfile, labels: Record<string, string>, avatarDataUrl: string | null) {
  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();

  const skillMarkup = (items: ReportProfile['technicalSkills']) =>
    items.length > 0
      ? `<table class="doc-skills">${items
          .map(
            (item, index) => `${index % 2 === 0 ? '<tr>' : ''}<td>
                <div class="doc-skill">
                  <div class="doc-skill-name">${escapeHtml(item.name)}</div>
                  <div class="doc-skill-meta">
                    ${escapeHtml(item.level || labels.notConfigured)}
                    <span class="doc-skill-progress">${item.progress}%</span>
                  </div>
                  <div class="doc-bar"><div class="doc-bar-fill" style="width:${Math.max(0, Math.min(100, item.progress))}%"></div></div>
                </div>
              </td>${index % 2 === 1 || index === items.length - 1 ? '</tr>' : ''}`
          )
          .join('')}</table>`
      : `<div class="doc-item"><p class="doc-item-text">${escapeHtml(labels.emptySkills)}</p></div>`;

  const recordMarkup = profile.records.length
    ? profile.records
        .map(
          (record) => `
            <div class="doc-item">
              <span class="doc-item-label">${escapeHtml(record.recordType)}</span>
              <p class="doc-item-title">${escapeHtml(record.title)}</p>
              <p class="doc-item-subtitle">${escapeHtml(record.footer)}</p>
              <p class="doc-item-text">${escapeHtml(record.description || labels.emptyDescription)}</p>
            </div>
          `
        )
        .join('')
    : `<div class="doc-item"><p class="doc-item-text">${escapeHtml(labels.emptyExperience)}</p></div>`;

  const projectMarkup = profile.projects.length
    ? profile.projects
        .map(
          (project) => `
            <div class="doc-item">
              <span class="doc-item-label">${escapeHtml(project.status || labels.projectLabel)}</span>
              <p class="doc-item-title">${escapeHtml(project.title)}</p>
              <p class="doc-item-subtitle">${escapeHtml(project.subtitle)}</p>
              ${
                project.tags.length
                  ? `<div class="doc-tags">${project.tags
                      .map((tag) => `<span class="doc-tag">${escapeHtml(tag)}</span>`)
                      .join('')}</div>`
                  : ''
              }
            </div>
          `
        )
        .join('')
    : `<div class="doc-item"><p class="doc-item-text">${escapeHtml(labels.emptyProjects)}</p></div>`;

  return `
    <div class="doc-sheet">
      <div class="doc-ribbon"></div>
      <div class="doc-header">
        <table class="doc-hero">
          <tr>
            <td class="doc-avatar-cell">
              <div class="doc-avatar">
                ${
                  avatarDataUrl
                    ? `<img src="${avatarDataUrl}" alt="${escapeHtml(profile.name)}" />`
                    : escapeHtml(initials || 'DP')
                }
              </div>
            </td>
            <td valign="top">
              <span class="doc-pill">${escapeHtml(labels.profile)}</span>
              <p class="doc-name">${escapeHtml(profile.name)}</p>
              <p class="doc-role">${escapeHtml(profile.role || labels.notConfigured)}</p>
              <p class="doc-summary">${escapeHtml(profile.summary || labels.emptySummary)}</p>
            </td>
          </tr>
        </table>
      </div>

      <div class="doc-main">
        <table class="doc-grid">
          <tr>
            <td>
              <div class="doc-card">
                <p class="doc-card-title">${escapeHtml(labels.contact)}</p>
                <p class="doc-meta"><strong>${escapeHtml(labels.email)}:</strong> ${escapeHtml(profile.contactEmail || labels.notConfigured)}</p>
                <p class="doc-meta"><strong>${escapeHtml(labels.phone)}:</strong> ${escapeHtml(profile.phone || labels.notConfigured)}</p>
                <p class="doc-meta"><strong>GitHub:</strong> ${escapeHtml(profile.github || labels.notConfigured)}</p>
                <p class="doc-meta"><strong>LinkedIn:</strong> ${escapeHtml(profile.linkedin || labels.notConfigured)}</p>
                <p class="doc-meta"><strong>${escapeHtml(labels.website)}:</strong> ${escapeHtml(profile.website || labels.notConfigured)}</p>
              </div>
            </td>
            <td>
              <div class="doc-card">
                <p class="doc-card-title">${escapeHtml(labels.trajectory)}</p>
                <div class="doc-tags">
                  ${profile.titleHierarchy.map((item) => `<span class="doc-tag">${escapeHtml(item)}</span>`).join('')}
                  ${profile.roleHierarchy.map((item) => `<span class="doc-tag">${escapeHtml(item)}</span>`).join('')}
                </div>
              </div>
            </td>
          </tr>
        </table>

        <div class="doc-section">
          <p class="doc-section-title">${escapeHtml(labels.technicalSkills)}</p>
          ${skillMarkup(profile.technicalSkills)}
        </div>

        <div class="doc-section">
          <p class="doc-section-title">${escapeHtml(labels.softSkills)}</p>
          ${skillMarkup(profile.softSkills)}
        </div>

        <div class="doc-section">
          <p class="doc-section-title">${escapeHtml(labels.projects)}</p>
          <div class="doc-list">${projectMarkup}</div>
        </div>

        <div class="doc-section">
          <p class="doc-section-title">${escapeHtml(labels.experience)}</p>
          <div class="doc-list">${recordMarkup}</div>
        </div>

        <div class="doc-footer">${escapeHtml(labels.footer)}</div>
      </div>
    </div>
  `;
}

async function imageUrlToDataUrl(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function PortfolioReportModal({
  open,
  onClose,
  dashboardData,
}: PortfolioReportModalProps) {
  const { t } = useI18n();
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  const profile = useMemo<ReportProfile | null>(() => {
    if (!dashboardData) {
      return null;
    }

    const settings = buildSettingsProfile(dashboardData);
    const skills = mapHabilidades(dashboardData.habilidades || []);
    const projects = mapProyectosToProjectItems(dashboardData.proyectos || []);
    const records = mapExperienciaYFormacion(dashboardData.experiencias || [], dashboardData.formaciones || []);

    return {
      name:
        dashboardData.usuario?.nombre_completo?.toString() ||
        dashboardData.auth_user?.name ||
        'Developer',
      role:
        dashboardData.usuario?.profesion?.toString() ||
        dashboardData.auth_user?.role ||
        'Developer',
      summary: settings.bio || '',
      contactEmail: settings.contactEmail || '',
      phone: settings.phone || '',
      github: settings.github || '',
      linkedin: settings.linkedin || '',
      website: settings.website || '',
      titleHierarchy: settings.titleHierarchy,
      roleHierarchy: settings.roleHierarchy,
      technicalSkills: skills.technical,
      softSkills: skills.soft,
      projects: projects.map((project) => ({
        id: project.id,
        title: project.title,
        subtitle: project.subtitle,
        tags: project.tags,
        status: project.status,
      })),
      records: records.map((record) => ({
        id: record.id,
        title: record.title,
        description: record.description,
        footer: record.footer,
        recordType: record.recordType,
      })),
      avatarUrl: dashboardData.usuario?.fotografiaUrl?.toString() || null,
    };
  }, [dashboardData]);

  useEffect(() => {
    let active = true;
    setPreviewReady(false);

    async function loadAvatar() {
      if (!open || !profile?.avatarUrl) {
        setAvatarDataUrl(null);
        return;
      }

      try {
        const dataUrl = await imageUrlToDataUrl(profile.avatarUrl);
        if (active) {
          setAvatarDataUrl(dataUrl);
        }
      } catch {
        if (active) {
          setAvatarDataUrl(null);
        }
      }
    }

    loadAvatar();
    return () => {
      active = false;
    };
  }, [open, profile?.avatarUrl]);

  const labels = useMemo(
    () => ({
      profile: t('dashboard.report.profile'),
      contact: t('dashboard.report.contact'),
      technicalSkills: t('dashboard.report.technicalSkills'),
      softSkills: t('dashboard.report.softSkills'),
      projects: t('dashboard.report.projects'),
      experience: t('dashboard.report.experience'),
      trajectory: t('dashboard.overview.trajectorySummary'),
      email: t('common.email'),
      phone: t('common.phone'),
      website: t('common.website'),
      emptySkills: t('dashboard.report.emptySkills'),
      emptyProjects: t('dashboard.report.emptyProjects'),
      emptyExperience: t('dashboard.report.emptyExperience'),
      emptySummary: t('dashboard.overview.notConfiguredYet'),
      notConfigured: t('dashboard.overview.notConfiguredYet'),
      emptyDescription: t('dashboard.report.emptyExperience'),
      projectLabel: t('dashboard.report.projects'),
      footer: t('dashboard.report.footer'),
    }),
    [t]
  );

  const reportName = useMemo(
    () =>
      t('dashboard.report.generatedName', {
        name: (profile?.name || 'Developer').replace(/\s+/g, '-'),
      }),
    [profile?.name, t]
  );

  const markup = useMemo(() => {
    if (!profile) {
      return '';
    }

    return buildMarkup(profile, labels, avatarDataUrl);
  }, [avatarDataUrl, labels, profile]);

  if (!open || !profile) {
    return null;
  }

  const fullDocument = buildDocumentShell(reportName, markup);

  const handleDownloadWord = () => {
    const blob = new Blob(['\ufeff', fullDocument], {
      type: 'application/msword',
    });
    downloadBlob(blob, `${reportName}.doc`);
  };

  const handleDownloadPdf = async () => {
    const frameDocument = previewFrameRef.current?.contentDocument;
    const exportNode = frameDocument?.querySelector('.doc-page') as HTMLElement | null;

    if (!exportNode) {
      throw new Error('No se pudo preparar la vista del reporte.');
    }

    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf'),
    ]);

    const canvas = await html2canvas(exportNode, {
      backgroundColor: '#edf3ff',
      scale: 2,
      useCORS: true,
      windowWidth: exportNode.scrollWidth,
      windowHeight: exportNode.scrollHeight,
    });

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const innerWidth = pageWidth - margin * 2;
    const innerHeight = pageHeight - margin * 2;
    const sliceHeight = Math.floor((innerHeight * canvas.width) / innerWidth);

    let offsetY = 0;
    let pageIndex = 0;

    while (offsetY < canvas.height) {
      const currentSliceHeight = Math.min(sliceHeight, canvas.height - offsetY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = currentSliceHeight;

      const pageContext = pageCanvas.getContext('2d');
      if (!pageContext) {
        throw new Error('No se pudo preparar una página del PDF.');
      }

      pageContext.fillStyle = '#edf3ff';
      pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        offsetY,
        canvas.width,
        currentSliceHeight,
        0,
        0,
        canvas.width,
        currentSliceHeight
      );

      const pageImage = pageCanvas.toDataURL('image/png');
      const renderedHeight = (currentSliceHeight * innerWidth) / canvas.width;

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(pageImage, 'PNG', margin, margin, innerWidth, renderedHeight, undefined, 'FAST');
      offsetY += currentSliceHeight;
      pageIndex += 1;
    }

    pdf.save(`${reportName}.pdf`);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);

      if (format === 'pdf') {
        await handleDownloadPdf();
      } else {
        handleDownloadWord();
      }

      try {
        await recordReportExport({
          format,
          name: reportName,
        });
      } catch {
        // No bloquea la descarga si el tracking falla.
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : 'No se pudo generar el reporte.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        className="flex h-[min(92vh,920px)] w-full max-w-6xl flex-col overflow-hidden rounded-[30px] border border-white/30 bg-white shadow-[0_40px_120px_-36px_rgba(15,23,42,0.55)]"
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--umss-border)] px-6 py-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--umss-brand)]">
              {t('dashboard.report.preview')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t('dashboard.report.title')}</h2>
            <p className="mt-2 text-sm text-slate-500">{t('dashboard.report.subtitle')}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--umss-border)] text-slate-500 transition hover:border-[var(--umss-brand)] hover:text-[var(--umss-brand)]"
            aria-label={t('dashboard.report.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)]">
          <aside className="overflow-y-auto border-b border-[var(--umss-border)] bg-[linear-gradient(180deg,rgba(248,250,255,0.98),rgba(255,255,255,0.98))] px-5 py-5 lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
            <div className="rounded-[28px] border border-[var(--umss-border)] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[var(--umss-lavender)] p-3 text-[var(--umss-brand)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.report.selectFormat')}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{t('dashboard.report.includePhoto')}</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {([
                  { value: 'pdf', icon: <ImageIcon className="h-4 w-4" />, subtitle: 'A4 / print-ready' },
                  { value: 'word', icon: <FileText className="h-4 w-4" />, subtitle: 'Editable .doc compatible' },
                ] as const).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      format === option.value
                        ? 'border-[var(--umss-brand)] bg-[var(--umss-lavender)] shadow-[0_12px_24px_-20px_rgba(80,72,229,0.9)]'
                        : 'border-[var(--umss-border)] bg-white hover:border-[rgba(80,72,229,0.3)]'
                    } w-full`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/80 p-2 text-[var(--umss-brand)] shadow-sm">{option.icon}</div>
                      <div>
                        <p className="text-lg font-semibold text-[var(--umss-brand)]">
                          {option.value === 'pdf' ? t('dashboard.report.pdf') : t('dashboard.report.word')}
                        </p>
                        <p className="text-xs text-slate-500">{option.subtitle}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--umss-brand)] via-[#5b63ff] to-[var(--umss-accent)] text-sm font-semibold text-white shadow-[0_18px_32px_-22px_rgba(80,72,229,0.9)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                {isExporting ? t('dashboard.report.generating') : t('dashboard.report.download')}
              </button>
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto overscroll-contain bg-[linear-gradient(180deg,#f4f7ff_0%,#eef3ff_100%)] px-4 py-5 sm:px-6 lg:px-7">
            <div className="overflow-hidden rounded-[28px] border border-[var(--umss-border)] bg-white shadow-[0_24px_60px_-40px_rgba(15,23,42,0.35)]">
              <iframe
                ref={previewFrameRef}
                title={t('dashboard.report.preview')}
                srcDoc={fullDocument}
                onLoad={() => setPreviewReady(true)}
                className="h-[66vh] min-h-[520px] w-full bg-[#edf3ff] lg:h-[calc(92vh-200px)]"
              />
            </div>
            {!previewReady ? (
              <p className="mt-3 text-xs text-slate-500">{t('common.loading')}</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
