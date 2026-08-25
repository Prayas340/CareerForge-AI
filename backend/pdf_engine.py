import os
import io
from pathlib import Path
from typing import Dict, Any, List, Optional
from .config import OUTPUT_DIR

# ReportLab imports with fallback
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether, PageBreak
    )
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# Theme Color Definitions (Expanded Curated Palettes)
PALETTES = {
    "teal": {
        "primary": colors.HexColor("#00685F"),
        "primary_light": colors.HexColor("#E6F5F3"),
        "secondary": colors.HexColor("#111C2D"),
        "accent": colors.HexColor("#855300"),
        "muted": colors.HexColor("#556966"),
        "border": colors.HexColor("#D8E3FB"),
        "bg_light": colors.HexColor("#F9F9FF"),
        "name": "Slate / Teal"
    },
    "navy": {
        "primary": colors.HexColor("#1E3A8A"),
        "primary_light": colors.HexColor("#EFF6FF"),
        "secondary": colors.HexColor("#0F172A"),
        "accent": colors.HexColor("#D97706"),
        "muted": colors.HexColor("#64748B"),
        "border": colors.HexColor("#E2E8F0"),
        "bg_light": colors.HexColor("#F8FAFC"),
        "name": "Navy / Gold"
    },
    "slate": {
        "primary": colors.HexColor("#334155"),
        "primary_light": colors.HexColor("#F1F5F9"),
        "secondary": colors.HexColor("#0F172A"),
        "accent": colors.HexColor("#0284C7"),
        "muted": colors.HexColor("#64748B"),
        "border": colors.HexColor("#CBD5E1"),
        "bg_light": colors.HexColor("#F8FAFC"),
        "name": "Classic Slate"
    },
    "emerald": {
        "primary": colors.HexColor("#047857"),
        "primary_light": colors.HexColor("#ECFDF5"),
        "secondary": colors.HexColor("#111827"),
        "accent": colors.HexColor("#B45309"),
        "muted": colors.HexColor("#4B5563"),
        "border": colors.HexColor("#D1FAE5"),
        "bg_light": colors.HexColor("#F9FAFB"),
        "name": "Charcoal / Emerald"
    },
    "indigo": {
        "primary": colors.HexColor("#4338CA"),
        "primary_light": colors.HexColor("#EEF2FF"),
        "secondary": colors.HexColor("#1E1B4B"),
        "accent": colors.HexColor("#7C3AED"),
        "muted": colors.HexColor("#6366F1"),
        "border": colors.HexColor("#E0E7FF"),
        "bg_light": colors.HexColor("#F8FAFC"),
        "name": "Royal Indigo"
    },
    "rosewood": {
        "primary": colors.HexColor("#9F1239"),
        "primary_light": colors.HexColor("#FFF1F2"),
        "secondary": colors.HexColor("#4C0519"),
        "accent": colors.HexColor("#BE123C"),
        "muted": colors.HexColor("#881337"),
        "border": colors.HexColor("#FFE4E6"),
        "bg_light": colors.HexColor("#FFFDFD"),
        "name": "Rosewood / Crimson"
    },
    "obsidian": {
        "primary": colors.HexColor("#0F172A"),
        "primary_light": colors.HexColor("#F8FAFC"),
        "secondary": colors.HexColor("#020617"),
        "accent": colors.HexColor("#38BDF8"),
        "muted": colors.HexColor("#475569"),
        "border": colors.HexColor("#E2E8F0"),
        "bg_light": colors.HexColor("#FFFFFF"),
        "name": "Obsidian / Titanium"
    },
    "amber": {
        "primary": colors.HexColor("#C2410C"),
        "primary_light": colors.HexColor("#FFF7ED"),
        "secondary": colors.HexColor("#431407"),
        "accent": colors.HexColor("#EA580C"),
        "muted": colors.HexColor("#78350F"),
        "border": colors.HexColor("#FFEDD5"),
        "bg_light": colors.HexColor("#FFFDFB"),
        "name": "Sunset Amber"
    }
}


class NumberedCanvas(canvas.Canvas):
    """Adds page numbers and subtle header/footer lines."""
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#879391"))
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 36, 20, page_text)
        self.drawString(36, 20, "CareerForge AI • Verified Executive CV")
        self.restoreState()


def compile_resume_pdf(cv_data: Dict[str, Any], archetype: str = "Executive", palette_name: str = "teal", output_filename: str = None) -> str:
    """
    Compiles structured CV data into a pixel-perfect, ATS-compliant PDF using ReportLab.
    Ensures zero layout overflow and strict contact data integrity (no phantom placeholders).
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed.")

    pal_key = palette_name.lower() if palette_name.lower() in PALETTES else "teal"
    theme = PALETTES[pal_key]

    p_info = cv_data.get("personal_info", {})
    full_name = p_info.get("full_name") or p_info.get("name") or "Professional"
    safe_name = "".join(c for c in full_name if c.isalnum() or c == "_")

    if not output_filename:
        output_filename = f"CareerForge_{safe_name}_{archetype}_{pal_key}.pdf"

    output_path = OUTPUT_DIR / output_filename
    
    # Document Setup (0.5 inch margins = 36 points for maximum content space without clipping)
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom Paragraph Styles
    name_style = ParagraphStyle(
        'CVName',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=theme["secondary"],
        spaceAfter=2
    )
    
    title_style = ParagraphStyle(
        'CVTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=theme["primary"],
        spaceAfter=6
    )
    
    contact_style = ParagraphStyle(
        'CVContact',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=theme["muted"]
    )
    
    section_heading = ParagraphStyle(
        'CVSectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=theme["primary"],
        spaceBefore=8,
        spaceAfter=4,
        textTransform='uppercase'
    )
    
    body_style = ParagraphStyle(
        'CVBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.5,
        textColor=theme["secondary"]
    )
    
    bullet_style = ParagraphStyle(
        'CVBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12,
        textColor=theme["secondary"],
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3
    )

    role_title_style = ParagraphStyle(
        'CVRoleTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=theme["secondary"]
    )

    date_style = ParagraphStyle(
        'CVDate',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=theme["muted"],
        alignment=2 # Right aligned
    )

    elements = []

    # ====================
    # 1. HEADER SECTION (Zero Phantom Contact Info)
    # ====================
    title = p_info.get("title") or p_info.get("domain") or "Senior Professional"
    
    contact_parts = []
    if p_info.get("location") and str(p_info.get("location")).strip():
        contact_parts.append(str(p_info.get("location")).strip())
    if p_info.get("email") and str(p_info.get("email")).strip():
        contact_parts.append(str(p_info.get("email")).strip())
    if p_info.get("phone") and str(p_info.get("phone")).strip():
        contact_parts.append(str(p_info.get("phone")).strip())
    if p_info.get("linkedin") and str(p_info.get("linkedin")).strip():
        contact_parts.append(str(p_info.get("linkedin")).strip())
    if p_info.get("github") and str(p_info.get("github")).strip():
        contact_parts.append(str(p_info.get("github")).strip())
    if p_info.get("website") and str(p_info.get("website")).strip():
        contact_parts.append(str(p_info.get("website")).strip())
    
    contact_line = "  •  ".join(contact_parts)

    elements.append(Paragraph(full_name, name_style))
    elements.append(Paragraph(title, title_style))
    if contact_line:
        elements.append(Paragraph(contact_line, contact_style))
    elements.append(Spacer(1, 4))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=theme["primary"], spaceBefore=4, spaceAfter=8))

    # ====================
    # 2. EXECUTIVE SUMMARY
    # ====================
    summary = cv_data.get("summary", "")
    if summary:
        elements.append(Paragraph("Professional Summary", section_heading))
        elements.append(Paragraph(summary, body_style))
        elements.append(Spacer(1, 6))

    # ====================
    # 3. CORE SKILLS
    # ====================
    skills_data = cv_data.get("skills", {})
    all_skills = []
    if isinstance(skills_data, dict):
        for cat, slist in skills_data.items():
            if slist and isinstance(slist, list):
                cat_title = cat.replace("_", " ").title()
                all_skills.append(f"<b>{cat_title}:</b> {', '.join(slist)}")
    elif isinstance(skills_data, list):
        all_skills.append(f"<b>Key Competencies:</b> {', '.join(skills_data)}")

    if all_skills:
        elements.append(Paragraph("Core Competencies & Technical Skills", section_heading))
        for s_line in all_skills:
            elements.append(Paragraph(s_line, body_style))
        elements.append(Spacer(1, 6))

    # ====================
    # 4. WORK EXPERIENCE
    # ====================
    experience_list = cv_data.get("work_experience", [])
    if experience_list:
        elements.append(Paragraph("Professional Experience", section_heading))
        
        for exp in experience_list:
            role = exp.get("role", "")
            company = exp.get("company", "")
            location = exp.get("location", "")
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "Present")
            
            dates = f"{start_date} – {end_date}" if start_date else end_date
            comp_loc = f"{company} | {location}" if location else company
            
            # Header table with 2 columns: Role/Company on left, Date on right
            left_text = f"<b>{role}</b>  —  <font color='{theme['muted'].hexval()}'>{comp_loc}</font>"
            data_row = [
                [Paragraph(left_text, role_title_style), Paragraph(dates, date_style)]
            ]
            exp_table = Table(data_row, colWidths=[400, 140])
            exp_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            
            exp_elements = [exp_table]
            for bullet in exp.get("bullets", []):
                bullet_p = Paragraph(f"• &nbsp; {bullet}", bullet_style)
                exp_elements.append(bullet_p)
                
            exp_elements.append(Spacer(1, 4))
            elements.append(KeepTogether(exp_elements))

    # ====================
    # 5. EDUCATION
    # ====================
    education_list = cv_data.get("education", [])
    if education_list:
        elements.append(Paragraph("Education", section_heading))
        for edu in education_list:
            deg = edu.get("degree", "")
            inst = edu.get("institution", "")
            loc = edu.get("location", "")
            yr = edu.get("year", "")
            det = edu.get("details", "")
            
            left_edu = f"<b>{deg}</b> — {inst}" + (f", {loc}" if loc else "")
            if det:
                left_edu += f" <font color='{theme['muted'].hexval()}'>({det})</font>"
                
            data_row = [
                [Paragraph(left_edu, body_style), Paragraph(yr, date_style)]
            ]
            edu_table = Table(data_row, colWidths=[430, 110])
            edu_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
            ]))
            elements.append(edu_table)
        elements.append(Spacer(1, 4))

    # ====================
    # 6. CERTIFICATIONS
    # ====================
    certs = cv_data.get("certifications", [])
    if certs:
        elements.append(Paragraph("Certifications & Honors", section_heading))
        for cert in certs:
            cname = cert.get("name", "")
            issuer = cert.get("issuer", "")
            cyr = cert.get("year", "")
            text = f"<b>{cname}</b>" + (f" — {issuer}" if issuer else "")
            data_row = [
                [Paragraph(text, body_style), Paragraph(cyr, date_style)]
            ]
            cert_table = Table(data_row, colWidths=[430, 110])
            cert_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 1),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
            ]))
            elements.append(cert_table)

    # Build the document
    doc.build(elements, canvasmaker=NumberedCanvas)
    return str(output_path)
