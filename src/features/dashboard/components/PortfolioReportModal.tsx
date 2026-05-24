import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, FileText, Globe, X } from 'lucide-react';
import {
  buildSettingsProfile,
  mapExperienciaYFormacion,
  mapHabilidades,
  mapProyectosToProjectItems,
  type ExperienceRecord,
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

function buildExportDocument(title: string, content: string) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <style>
        body { font-family: Inter, Segoe UI, Arial, sans-serif; margin: 0; background: #f3f6ff; color: #0f172a; }
        .report-shell { max-width: 860px; margin: 0 auto; padding: 36px 28px; }
        .report-sheet { background: white; border-radius: 28px; padding: 34px; border: 1px solid #dbe4ff; }
        .report-header { display: flex; gap: 24px; align-items: center; padding-bottom: 24px; border-bottom: 1px solid #e8eeff; }
        .report-avatar { width: 108px; height: 108px; border-radius: 24px; background: linear-gradient(135deg, #5048e5, #6c63ff); overflow: hidden; display: flex; align-items: center; justify-content: center; color: white; font-size: 34px; font-weight: 700; }
        .report-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .report-eyebrow { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #4f46e5; font-weight: 700; }
        .report-name { font-size: 34px; font-weight: 800; margin: 10px 0 8px; color: #111827; }
        .report-role { font-size: 18px; font-weight: 700; color: #334155; margin: 0; }
        .report-summary { margin-top: 14px; font-size: 14px; line-height: 1.7; color: #475569; }
        .report-grid { display: grid; gap: 18px; margin-top: 26px; }
        .report-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .report-card { border: 1px solid #e5ebff; border-radius: 22px; padding: 20px; background: #fbfcff; }
        .report-card h3 { margin: 0 0 12px; font-size: 16px; color: #1e293b; }
        .report-section { margin-top: 26px; }
        .report-section h2 { margin: 0 0 12px; font-size: 20px; color: #111827; }
        .report-chip { display: inline-flex; align-items: center; padding: 6px 10px; margin: 6px 6px 0 0; border-radius: 999px; border: 1px solid #d8e0ff; background: #eef2ff; color: #3730a3; font-size: 12px; font-weight: 700; }
        .report-list { display: grid; gap: 12px; }
        .report-item { border: 1px solid #e5ebff; border-radius: 18px; padding: 16px; background: white; }
        .report-item-title { margin: 0 0 6px; font-size: 15px; font-weight: 700; color: #0f172a; }
        .report-item-subtitle { margin: 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6366f1; font-weight: 700; }
        .report-item-text { margin: 8px 0 0; font-size: 13px; line-height: 1.6; color: #475569; }
        .report-progress { margin-top: 10px; height: 10px; border-radius: 999px; background: #e9edff; overflow: hidden; }
        .report-progress > span { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, #5048e5, #6c63ff); }
        .report-meta { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-top: 10px; font-size: 12px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="report-shell">${content}</div>
    </body>
  </html>`;
}

export function PortfolioReportModal({
  open,
  onClose,
  dashboardData,
}: PortfolioReportModalProps) {
  const { t } = useI18n();
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const profile = useMemo(() => {
    if (!dashboardData) {
      return null;
    }

    const settings = buildSettingsProfile(dashboardData);
    const skills = mapHabilidades(dashboardData.habilidades ?? []);
    const projects = mapProyectosToProjectItems(dashboardData.proyectos ?? []);
    const records = mapExperienciaYFormacion(
      dashboardData.experiencias ?? [],
      dashboardData.formaciones ?? []
    );

    return {
      settings,
      skills,
      projects,
      records,
      name:
        dashboardData.usuario?.nombre_completo?.toString() ||
        dashboardData.auth_user?.name ||
        'Developer',
      role:
        dashboardData.usuario?.profesion?.toString() ||
        dashboardData.auth_user?.role ||
        'Developer',
      avatarUrl: dashboardData.usuario?.fotografiaUrl?.toString() || null,
    };
  }, [dashboardData]);

  if (!open || !profile) {
    return null;
  }

  const initials = profile.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join('')
    .toUpperCase();
  const reportName = t('dashboard.report.generatedName', {
    name: profile.name.replace(/\s+/g, '-'),
  });

  const handleDownloadWord = async () => {
    if (!previewRef.current) {
      return;
    }

    const html = buildExportDocument(reportName, previewRef.current.innerHTML);
    const blob = new Blob(['\ufeff', html], {
      type: 'application/msword',
    });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${reportName}.doc`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    if (!previewRef.current) {
      return;
    }

    const canvas = await html2canvas(previewRef.current, {
      scale: 2,
      backgroundColor: '#f3f6ff',
      useCORS: true,
    });

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 24;
    const contentWidth = pdfWidth - margin * 2;
    const contentHeight = (canvas.height * contentWidth) / canvas.width;

    let remainingHeight = contentHeight;
    let position = margin;

    pdf.addImage(imageData, 'PNG', margin, position, contentWidth, contentHeight);
    remainingHeight -= pdfHeight - margin * 2;

    while (remainingHeight > 0) {
      position = remainingHeight - contentHeight + margin;
      pdf.addPage();
      pdf.addImage(imageData, 'PNG', margin, position, contentWidth, contentHeight);
      remainingHeight -= pdfHeight - margin * 2;
    }

    pdf.save(`${reportName}.pdf`);
  };

  const handleExport = async () => {
    if (!previewRef.current || isExporting) {
      return;
    }

    try {
      setIsExporting(true);

      if (format === 'pdf') {
        await handleDownloadPdf();
      } else {
        await handleDownloadWord();
      }

      await recordReportExport({
        format,
        name: reportName,
        content_html: buildExportDocument(reportName, previewRef.current.innerHTML),
      });
    } finally {
      setIsExporting(false);
    }
  };

  const renderSkills = (items: Array<{ id: string; name: string; level: string; progress: number }>) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">{t('dashboard.report.emptySkills')}</p>;
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((skill) => (
          <article key={skill.id} className="rounded-3xl border border-[#e5ebff] bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-900">{skill.name}</h4>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
              <span>{skill.level}</span>
              <span>{skill.progress}%</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#e9edff]">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#5048e5] to-[#6c63ff]"
                style={{ width: `${skill.progress}%` }}
              />
            </div>
          </article>
        ))}
      </div>
    );
  };

  const renderRecords = (items: ExperienceRecord[]) => {
    if (items.length === 0) {
      return <p className="text-sm text-slate-500">{t('dashboard.report.emptyExperience')}</p>;
    }

    return (
      <div className="grid gap-4">
        {items.map((record) => (
          <article key={record.id} className="rounded-3xl border border-[#e5ebff] bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
              {record.recordType}
            </p>
            <h4 className="mt-2 text-sm font-semibold text-slate-900">{record.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{record.description}</p>
            <p className="mt-3 text-xs font-medium text-slate-500">{record.footer}</p>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-[var(--umss-border)] bg-white shadow-[0_30px_90px_-30px_rgba(15,23,42,0.5)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--umss-border)] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
              {t('dashboard.report.preview')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">{t('dashboard.report.title')}</h2>
            <p className="mt-2 text-sm text-slate-600">{t('dashboard.report.subtitle')}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[var(--umss-border)] p-2 text-slate-500 transition hover:text-slate-900"
            aria-label={t('dashboard.report.close')}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="border-r border-[var(--umss-border)] bg-[var(--umss-surface)] p-6">
            <div className="rounded-[28px] border border-[var(--umss-border)] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(80,72,229,0.12)] text-[var(--umss-brand)]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('dashboard.report.selectFormat')}</p>
                  <p className="text-xs text-slate-500">{t('dashboard.report.includePhoto')}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {([
                  ['pdf', t('dashboard.report.pdf')],
                  ['word', t('dashboard.report.word')],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormat(value)}
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      format === value
                        ? 'border-[var(--umss-brand)] bg-[rgba(80,72,229,0.08)] text-[var(--umss-brand)]'
                        : 'border-[var(--umss-border)] bg-white text-slate-600 hover:border-[rgba(80,72,229,0.25)]'
                    }`}
                  >
                    <p className="font-semibold">{label}</p>
                    <p className="mt-1 text-xs text-inherit">
                      {value === 'pdf' ? 'A4 / print-ready' : 'Editable .doc compatible'}
                    </p>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C63FF] via-[var(--umss-brand)] to-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Download className="h-4 w-4" />
                {isExporting ? t('dashboard.report.generating') : t('dashboard.report.download')}
              </button>
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto bg-[#f3f6ff] p-6">
            <div ref={previewRef} className="mx-auto max-w-4xl rounded-[32px] border border-[#dbe4ff] bg-white p-8 shadow-sm">
              <section className="flex flex-col gap-6 border-b border-[#e8eeff] pb-8 md:flex-row md:items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[28px] bg-gradient-to-br from-[#5048e5] to-[#6c63ff] text-3xl font-bold text-white shadow-lg">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(80,72,229,0.16)] bg-[rgba(80,72,229,0.08)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
                    <Globe className="h-3.5 w-3.5" />
                    {t('dashboard.report.profile')}
                  </div>
                  <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900">{profile.name}</h1>
                  <p className="mt-2 text-lg font-semibold text-slate-600">{profile.role}</p>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                    {profile.settings.bio || '—'}
                  </p>
                </div>
              </section>

              <section className="mt-8 grid gap-5 md:grid-cols-2">
                <article className="rounded-[28px] border border-[#e5ebff] bg-[#fbfcff] p-5">
                  <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.report.contact')}</h3>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <p><span className="font-semibold text-slate-900">{t('common.email')}:</span> {profile.settings.contactEmail || '—'}</p>
                    <p><span className="font-semibold text-slate-900">{t('common.phone')}:</span> {profile.settings.phone || '—'}</p>
                    <p><span className="font-semibold text-slate-900">{t('common.github')}:</span> {profile.settings.github || '—'}</p>
                    <p><span className="font-semibold text-slate-900">{t('common.linkedin')}:</span> {profile.settings.linkedin || '—'}</p>
                  </div>
                </article>

                <article className="rounded-[28px] border border-[#e5ebff] bg-[#fbfcff] p-5">
                  <h3 className="text-sm font-semibold text-slate-900">{t('dashboard.overview.trajectorySummary')}</h3>
                  <div className="mt-4">
                    {[...profile.settings.titleHierarchy, ...profile.settings.roleHierarchy].map((item) => (
                      <span
                        key={item}
                        className="mr-2 mt-2 inline-flex rounded-full border border-[#d8e0ff] bg-[#eef2ff] px-3 py-1 text-xs font-semibold text-[#3730a3]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </article>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">{t('dashboard.report.technicalSkills')}</h2>
                <div className="mt-4">{renderSkills(profile.skills.technical)}</div>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">{t('dashboard.report.softSkills')}</h2>
                <div className="mt-4">{renderSkills(profile.skills.soft)}</div>
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">{t('dashboard.report.projects')}</h2>
                {profile.projects.length > 0 ? (
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {profile.projects.map((project) => (
                      <article key={project.id} className="rounded-[28px] border border-[#e5ebff] bg-[#fbfcff] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--umss-brand)]">
                          {project.status}
                        </p>
                        <h3 className="mt-2 text-base font-semibold text-slate-900">{project.title}</h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{project.subtitle}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={`${project.id}-${tag}`}
                              className="rounded-full border border-[#d8e0ff] bg-white px-3 py-1 text-xs font-semibold text-slate-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">{t('dashboard.report.emptyProjects')}</p>
                )}
              </section>

              <section className="mt-8">
                <h2 className="text-xl font-bold text-slate-900">{t('dashboard.report.experience')}</h2>
                <div className="mt-4">{renderRecords(profile.records)}</div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
