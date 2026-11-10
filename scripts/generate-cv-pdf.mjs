import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';
import { jsPDF } from 'jspdf';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const languages = ['en', 'es'];

function parseResumeMarkdown(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(`Invalid frontmatter in ${filePath}`);
  }
  return yaml.parse(match[1]);
}

function generateResumePdf(data, outputPath) {
  const doc = new jsPDF({
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;
  let y = 38;

  function checkPageBreak(requiredHeight) {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addSectionHeader(title) {
    y += 10;
    checkPageBreak(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(14, 116, 144); // Cyan / Blue-grey
    doc.text(title.toUpperCase(), margin, y);
    y += 4;
    doc.setDrawColor(203, 213, 225); // Slate 300
    doc.setLineWidth(0.75);
    doc.line(margin, y, margin + contentWidth, y);
    y += 12;
  }

  // --- HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(data.name || 'Guido Yair Abel Jeri Saldaña', margin, y);
  y += 16;

  // Clean 2-Line Subheader / Contact Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate 600

  // Line 1: Role • Location • Email • Phone
  const line1 = [
    data.quickInformation?.[0] || 'Computer Science Student',
    data.quickInformation?.[1] || 'Lima, Peru',
    data.quickInformation?.[2] || 'Email: Guidoyair@hotmail.com',
    data.quickInformation?.[3] || 'Tel: +51 966 121 010'
  ].join('   •   ');
  doc.text(line1, margin, y);
  y += 12;

  // Line 2: LinkedIn • GitHub • Portfolio
  const line2 = [
    data.quickInformation?.[4] || 'LinkedIn: Yair Jeri',
    data.quickInformation?.[6] || 'GitHub: YairJeri',
    data.quickInformation?.[5] || 'Portfolio: cv-website-ruby.vercel.app'
  ].join('   •   ');
  doc.text(line2, margin, y);
  y += 8;

  // --- PROFESSIONAL PROFILE ---
  if (data.professionalProfile?.content) {
    addSectionHeader(data.professionalProfile.title || (data.lang === 'es' ? 'Perfil Profesional' : 'Professional Profile'));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // Slate 700

    for (const paragraph of data.professionalProfile.content) {
      const splitText = doc.splitTextToSize(paragraph, contentWidth);
      checkPageBreak(splitText.length * 11.5 + 4);
      doc.text(splitText, margin, y);
      y += splitText.length * 11.5 + 3;
    }
  }

  // --- TECHNICAL SKILLS ---
  if (data.skills?.content) {
    addSectionHeader(data.skills.title || (data.lang === 'es' ? 'Habilidades Técnicas' : 'Technical Skills'));
    doc.setFontSize(8.5);

    const labelColWidth = 175;
    const descColWidth = contentWidth - labelColWidth - 6;

    for (const skillGroup of data.skills.content) {
      for (const [groupName, items] of Object.entries(skillGroup)) {
        const itemsStr = Array.isArray(items) ? items.join('; ') : String(items);
        const splitItems = doc.splitTextToSize(itemsStr, descColWidth);
        const blockHeight = Math.max(13, splitItems.length * 11);

        checkPageBreak(blockHeight + 3);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(`• ${groupName}:`, margin + 4, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(splitItems, margin + labelColWidth, y);

        y += blockHeight + 2;
      }
    }
  }

  // --- SELECTED PROJECTS (2-Line Format) ---
  if (data.projects?.content) {
    addSectionHeader(data.projects.title || (data.lang === 'es' ? 'Proyectos Seleccionados' : 'Selected Projects'));
    doc.setFontSize(8.5);

    for (const proj of data.projects.content) {
      // Parse project format: "Name (Tech): Description"
      const colonIndex = proj.indexOf(':');
      let titlePart = proj;
      let descPart = '';

      if (colonIndex !== -1) {
        titlePart = proj.substring(0, colonIndex).trim();
        descPart = proj.substring(colonIndex + 1).trim();
      }

      const splitDesc = doc.splitTextToSize(descPart, contentWidth - 14);
      const projHeight = 12 + splitDesc.length * 11 + 4;
      checkPageBreak(projHeight);

      // Line 1: Project Name & Tech Badge
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${titlePart}`, margin + 4, y);
      y += 11;

      // Line 2+: Indented technical summary
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(splitDesc, margin + 14, y);
      y += splitDesc.length * 11 + 3;
    }
  }

  // --- EDUCATION ---
  if (data.education?.content) {
    addSectionHeader(data.education.title || (data.lang === 'es' ? 'Educación' : 'Education'));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    for (const edu of data.education.content) {
      const splitEdu = doc.splitTextToSize(`• ${edu}`, contentWidth - 8);
      checkPageBreak(splitEdu.length * 11.5 + 3);
      doc.text(splitEdu, margin + 4, y);
      y += splitEdu.length * 11.5 + 2;
    }
  }

  // --- LANGUAGES ---
  if (data.languages?.content) {
    addSectionHeader(data.languages.title || (data.lang === 'es' ? 'Idiomas' : 'Languages'));
    doc.setFontSize(8.5);

    for (const langItem of data.languages.content) {
      checkPageBreak(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`• ${langItem.language}:`, margin + 4, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(langItem.level, margin + 85, y);
      y += 12;
    }
  }

  // --- CERTIFICATES APPENDED AS PAGES ---
  const certDir = path.join(projectRoot, 'src', 'content', 'cert');
  if (fs.existsSync(certDir)) {
    const certFiles = fs.readdirSync(certDir)
      .filter(f => /\.(jpe?g|png)$/i.test(f))
      .sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

    for (const certFile of certFiles) {
      const certPath = path.join(certDir, certFile);
      const imgBuffer = fs.readFileSync(certPath);
      const base64 = imgBuffer.toString('base64');
      const imgData = 'data:image/jpeg;base64,' + base64;

      try {
        const props = doc.getImageProperties(imgData);
        const isLandscape = props.width >= props.height;

        // Add page matching orientation
        doc.addPage('a4', isLandscape ? 'landscape' : 'portrait');

        const curPageW = doc.internal.pageSize.getWidth();
        const curPageH = doc.internal.pageSize.getHeight();

        // Fit edge-to-edge with 18pt margin
        const certMargin = 18;
        const maxW = curPageW - certMargin * 2;
        const maxH = curPageH - certMargin * 2;
        const imgAspect = props.width / props.height;

        let targetW = maxW;
        let targetH = targetW / imgAspect;

        if (targetH > maxH) {
          targetH = maxH;
          targetW = targetH * imgAspect;
        }

        const posX = (curPageW - targetW) / 2;
        const posY = (curPageH - targetH) / 2;

        doc.addImage(imgData, 'JPEG', posX, posY, targetW, targetH);
      } catch (err) {
        console.warn(`Could not add cert ${certFile} to PDF:`, err.message);
      }
    }
  }

  // Ensure target directory exists and save PDF
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, pdfBuffer);
  console.log(`Generated CV PDF: ${outputPath} (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
}

function buildAllPdfs() {
  console.log('Building CV PDFs directly from Markdown content...');

  for (const lang of languages) {
    const mdPath = path.join(projectRoot, 'src', 'content', 'resume', lang, 'resume.md');
    if (!fs.existsSync(mdPath)) {
      console.warn(`File not found: ${mdPath}`);
      continue;
    }

    const data = parseResumeMarkdown(mdPath);

    // Save to public/files so Astro dev & build automatically includes them
    const publicPdfPath = path.join(projectRoot, 'public', 'files', `CV_Yair Jeri_${lang}.pdf`);
    generateResumePdf(data, publicPdfPath);

    // Also sync to dist/files if dist exists
    const distPdfPath = path.join(projectRoot, 'dist', 'files', `CV_Yair Jeri_${lang}.pdf`);
    if (fs.existsSync(path.join(projectRoot, 'dist'))) {
      generateResumePdf(data, distPdfPath);
    }
  }

  console.log('CV PDF Generation completed successfully.');
}

buildAllPdfs();
