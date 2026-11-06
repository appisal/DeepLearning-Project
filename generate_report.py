import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()

    # Set tight 0.45-inch margins for exact 1-page fit
    for section in doc.sections:
        section.top_margin = Inches(0.42)
        section.bottom_margin = Inches(0.42)
        section.left_margin = Inches(0.45)
        section.right_margin = Inches(0.45)

    # Color palette
    NAVY = RGBColor(15, 30, 60)       # #0F1E3C
    TEAL = RGBColor(13, 148, 136)     # #0D9488
    SLATE = RGBColor(71, 85, 105)     # #475569
    DARK = RGBColor(30, 41, 59)       # #1E293B
    BLUE_LINK = RGBColor(2, 132, 199) # #0284C7

    # Helper to set paragraph spacing
    def set_spacing(p, before=0, after=2, line=1.05):
        p.paragraph_format.space_before = Pt(before)
        p.paragraph_format.space_after = Pt(after)
        p.paragraph_format.line_spacing = line

    # Helper for cell shading
    def set_cell_background(cell, hex_color):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_cell_margins(cell, top=60, bottom=60, left=100, right=100):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for margin, value in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{margin}')
            node.set(qn('w:w'), str(value))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    # =========================================================================
    # HEADER SECTION
    # =========================================================================
    title_p = doc.add_paragraph()
    set_spacing(title_p, before=0, after=1, line=1.1)
    run_title = title_p.add_run("Deep Learning Simulation Lab: Core Generalization & Optimization")
    run_title.font.name = "Arial"
    run_title.font.size = Pt(14)
    run_title.font.bold = True
    run_title.font.color.rgb = NAVY

    sub_p = doc.add_paragraph()
    set_spacing(sub_p, before=0, after=4, line=1.05)
    r_sub = sub_p.add_run("Technical Report & Interactive System Overview • Project Author: ")
    r_sub.font.name = "Arial"
    r_sub.font.size = Pt(8.5)
    r_sub.font.color.rgb = SLATE

    r_author = sub_p.add_run("Aditya Pisal")
    r_author.font.name = "Arial"
    r_author.font.size = Pt(8.5)
    r_author.font.bold = True
    r_author.font.color.rgb = NAVY

    r_sub2 = sub_p.add_run(" • Tech Stack: React 19, TypeScript, Vite, SVG Math Engine, GitHub Pages")
    r_sub2.font.name = "Arial"
    r_sub2.font.size = Pt(8.5)
    r_sub2.font.color.rgb = SLATE

    # =========================================================================
    # DEPLOYED LINKS CALLOUT BOX (PROMINENT)
    # =========================================================================
    link_table = doc.add_table(rows=1, cols=1)
    link_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    link_cell = link_table.cell(0, 0)
    link_cell.width = Inches(7.6)
    set_cell_background(link_cell, "F0F9FF")
    set_cell_margins(link_cell, top=70, bottom=70, left=120, right=120)

    # Border for cell
    tcPr = link_cell._tc.get_or_add_tcPr()
    borders_xml = (
        f'<w:tcBorders {nsdecls("w")}>'
        f'<w:top w:val="single" w:sz="8" w:space="0" w:color="0284C7"/>'
        f'<w:left w:val="single" w:sz="24" w:space="0" w:color="0284C7"/>'
        f'<w:bottom w:val="single" w:sz="8" w:space="0" w:color="0284C7"/>'
        f'<w:right w:val="single" w:sz="8" w:space="0" w:color="0284C7"/>'
        f'</w:tcBorders>'
    )
    tcPr.append(parse_xml(borders_xml))

    lp = link_cell.paragraphs[0]
    set_spacing(lp, before=0, after=1, line=1.1)

    r_badge = lp.add_run("🌐 LIVE DEPLOYED WEB APPLICATION: ")
    r_badge.font.name = "Arial"
    r_badge.font.size = Pt(9)
    r_badge.font.bold = True
    r_badge.font.color.rgb = BLUE_LINK

    r_url = lp.add_run("https://appisal.github.io/DeepLearning-Project/")
    r_url.font.name = "Arial"
    r_url.font.size = Pt(9)
    r_url.font.bold = True
    r_url.font.underline = True
    r_url.font.color.rgb = BLUE_LINK

    r_repo = lp.add_run("   |   GitHub Source: ")
    r_repo.font.name = "Arial"
    r_repo.font.size = Pt(8.5)
    r_repo.font.color.rgb = SLATE

    r_repourl = lp.add_run("https://github.com/appisal/DeepLearning-Project")
    r_repourl.font.name = "Arial"
    r_repourl.font.size = Pt(8.5)
    r_repourl.font.underline = True
    r_repourl.font.color.rgb = DARK

    # =========================================================================
    # EXECUTIVE SUMMARY
    # =========================================================================
    exec_p = doc.add_paragraph()
    set_spacing(exec_p, before=4, after=4, line=1.05)
    r_ex_title = exec_p.add_run("Project Objective: ")
    r_ex_title.font.name = "Arial"
    r_ex_title.font.size = Pt(8.5)
    r_ex_title.font.bold = True
    r_ex_title.font.color.rgb = NAVY

    r_ex_text = exec_p.add_run(
        "To eliminate pedagogical ambiguity in deep learning foundations by engineering a streamlined, pure-simulation workbench. "
        "The application visualizes in real time: (1) Overfitting vs Underfitting, (2) L1 (Lasso) vs L2 (Ridge) Regularization mechanisms, "
        "(3) Gradient Descent 2D loss landscape dynamics, and (4) the Bias-Variance & Epoch Early-Stopping tradeoffs with live analytical feedback."
    )
    r_ex_text.font.name = "Arial"
    r_ex_text.font.size = Pt(8.5)
    r_ex_text.font.color.rgb = DARK

    # =========================================================================
    # 4 CORE SIMULATION PILLARS (2-COLUMN TABLE)
    # =========================================================================
    grid_table = doc.add_table(rows=2, cols=2)
    grid_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    grid_table.autofit = False

    col_widths = [Inches(3.75), Inches(3.75)]
    for row in grid_table.rows:
        for idx, width in enumerate(col_widths):
            row.cells[idx].width = width

    # Cell (0,0): Pillar 1
    c00 = grid_table.cell(0, 0)
    set_cell_background(c00, "FAFAFA")
    set_cell_margins(c00, top=40, bottom=40, left=60, right=60)
    p00 = c00.paragraphs[0]
    set_spacing(p00, before=0, after=2, line=1.05)
    r = p00.add_run("1. Overfitting & Underfitting Simulation\n")
    r.font.name = "Arial"; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = NAVY
    r = p00.add_run(
        "• 1D Polynomial Fitting: Real-time slider sweep (degree d = 1 to 14), dataset size (N = 8 to 60), and noise (σ).\n"
        "• Quantitative MSE Tracking: Computes Train MSE, unseen Test MSE, and Generalization Gap (|Test - Train|) instantly.\n"
        "• 2D Decision Boundaries: Concentric donuts, moons, and XOR quadrant classification comparing linear, optimal RBF, and overfit boundary islands."
    )
    r.font.name = "Arial"; r.font.size = Pt(8); r.font.color.rgb = DARK

    # Cell (0,1): Pillar 2
    c01 = grid_table.cell(0, 1)
    set_cell_background(c01, "FAFAFA")
    set_cell_margins(c01, top=40, bottom=40, left=60, right=60)
    p01 = c01.paragraphs[0]
    set_spacing(p01, before=0, after=2, line=1.05)
    r = p01.add_run("2. L1 & L2 Regularization (Lasso vs Ridge)\n")
    r.font.name = "Arial"; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = NAVY
    r = p01.add_run(
        "• Exact L1 Sparsity: Coordinate descent with soft-thresholding drives redundant weights to strictly 0.000 (automated feature pruning).\n"
        "• L2 Weight Decay: Shrinks high-order weights proportionally (w² penalty), taming wild polynomial oscillations without zeroing terms.\n"
        "• 2D Geometric Contour Space: Visualizes expanding loss ellipses touching L1 diamond corners on axes vs smooth L2 circular tangency."
    )
    r.font.name = "Arial"; r.font.size = Pt(8); r.font.color.rgb = DARK

    # Cell (1,0): Pillar 3
    c10 = grid_table.cell(1, 0)
    set_cell_background(c10, "FAFAFA")
    set_cell_margins(c10, top=40, bottom=40, left=60, right=60)
    p10 = c10.paragraphs[0]
    set_spacing(p10, before=0, after=2, line=1.05)
    r = p10.add_run("3. Gradient Descent Optimization Simulation\n")
    r.font.name = "Arial"; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = NAVY
    r = p10.add_run(
        "• Interactive 2D Loss Surface: Anisotropic valley J(w₁, w₂); click anywhere on the canvas to drop starting coordinates.\n"
        "• Learning Rate (α) Regimes: Visualizes crawl (α=0.02), optimal convergence (α=0.18), ravine oscillations (α=0.36), and divergence (α>0.50).\n"
        "• Optimizers & Penalty: Side-by-side comparison of Vanilla GD, Momentum (β=0.85), Adam, and inward L2 weight decay pull."
    )
    r.font.name = "Arial"; r.font.size = Pt(8); r.font.color.rgb = DARK

    # Cell (1,1): Pillar 4
    c11 = grid_table.cell(1, 1)
    set_cell_background(c11, "FAFAFA")
    set_cell_margins(c11, top=40, bottom=40, left=60, right=60)
    p11 = c11.paragraphs[0]
    set_spacing(p11, before=0, after=2, line=1.05)
    r = p11.add_run("4. Bias-Variance & Epoch Tradeoff Dynamics\n")
    r.font.name = "Arial"; r.font.size = Pt(9); r.font.bold = True; r.font.color.rgb = NAVY
    r = p11.add_run(
        "• Bias-Variance Decomposition: Interactive U-curve proving Total Error = Bias² + Variance + σ² noise floor across capacity levels.\n"
        "• Dynamic Error Fraction: Live stacked progress bar showing the shift from high-bias domination to high-variance domination.\n"
        "• Epoch Early Stopping: 60-epoch progression marking the exact inflection point (Epoch 22) where validation error turns upward."
    )
    r.font.name = "Arial"; r.font.size = Pt(8); r.font.color.rgb = DARK

    # Apply soft borders to grid cells
    for row in grid_table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            bxml = (
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:left w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'<w:right w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(parse_xml(bxml))

    # =========================================================================
    # SUMMARY COMPARISON TABLE
    # =========================================================================
    h_p = doc.add_paragraph()
    set_spacing(h_p, before=4, after=2, line=1.05)
    r_h = h_p.add_run("Quantitative Comparison Matrix Across Model Regimes")
    r_h.font.name = "Arial"
    r_h.font.size = Pt(8.5)
    r_h.font.bold = True
    r_h.font.color.rgb = NAVY

    data_table = doc.add_table(rows=5, cols=5)
    data_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    data_table.autofit = False

    t_widths = [Inches(1.5), Inches(1.5), Inches(1.5), Inches(1.5), Inches(1.6)]
    headers = ["Dimension", "Underfitting (High Bias)", "Optimal Generalization", "Overfitting (High Var)", "Regularized (L1/L2)"]
    rows_data = [
        ["Model Capacity", "d = 1 (Linear / Rigid)", "d = 3 to 4 (Cubic)", "d = 10 to 14 (Extreme)", "d = 8 to 12 + Penalty"],
        ["Train MSE / Loss", "High (> 0.22)", "Low (~ 0.04)", "Near Zero (< 0.005)", "Controlled (~ 0.05)"],
        ["Test MSE / Loss", "High (> 0.25)", "Minimal (~ 0.05)", "Explosive (> 0.40+)", "Minimized (~ 0.06)"],
        ["Remediation", "Increase parameters / degree", "Preserve balance", "Add L1/L2, prune, more data", "Tuned λ hyperparameter"]
    ]

    # Format header row
    hdr_cells = data_table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].width = t_widths[i]
        set_cell_background(hdr_cells[i], "1E293B")
        set_cell_margins(hdr_cells[i], top=30, bottom=30, left=40, right=40)
        hp = hdr_cells[i].paragraphs[0]
        set_spacing(hp, before=0, after=0, line=1.0)
        hrun = hp.add_run(title)
        hrun.font.name = "Arial"
        hrun.font.size = Pt(7.5)
        hrun.font.bold = True
        hrun.font.color.rgb = RGBColor(255, 255, 255)

    # Format data rows
    for r_idx, row_values in enumerate(rows_data):
        row_cells = data_table.rows[r_idx + 1].cells
        bg_col = "F8FAFC" if r_idx % 2 == 1 else "FFFFFF"
        for c_idx, val in enumerate(row_values):
            row_cells[c_idx].width = t_widths[c_idx]
            set_cell_background(row_cells[c_idx], bg_col)
            set_cell_margins(row_cells[c_idx], top=25, bottom=25, left=40, right=40)
            dp = row_cells[c_idx].paragraphs[0]
            set_spacing(dp, before=0, after=0, line=1.0)
            drun = dp.add_run(val)
            drun.font.name = "Arial"
            drun.font.size = Pt(7.5)
            if c_idx == 0:
                drun.font.bold = True
                drun.font.color.rgb = NAVY
            else:
                drun.font.color.rgb = DARK

    # Table borders
    for row in data_table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            bxml = (
                f'<w:tcBorders {nsdecls("w")}>'
                f'<w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:left w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'<w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>'
                f'</w:tcBorders>'
            )
            tcPr.append(parse_xml(bxml))

    # =========================================================================
    # KEY CONCLUSION / SYNTHESIS
    # =========================================================================
    concl_p = doc.add_paragraph()
    set_spacing(concl_p, before=4, after=0, line=1.05)
    r_c_title = concl_p.add_run("Key Theoretical Conclusion: ")
    r_c_title.font.name = "Arial"
    r_c_title.font.size = Pt(8)
    r_c_title.font.bold = True
    r_c_title.font.color.rgb = NAVY

    r_c_text = concl_p.add_run(
        "Optimal generalization is not achieved by minimizing empirical training error alone, but by balancing capacity against data density. "
        "L1 regularization acts as an intrinsic feature selector via non-differentiable diamond vertices, L2 stabilizes loss surface conditioning, "
        "and momentum stabilizes gradient trajectories through ill-conditioned ravines. All concepts are verified live at the deployed URL."
    )
    r_c_text.font.name = "Arial"
    r_c_text.font.size = Pt(8)
    r_c_text.font.color.rgb = SLATE

    output_path = r"c:\Aditya Pisal\DEEP LEARNING PROJECT\Deep_Learning_Simulation_Lab_Report.docx"
    doc.save(output_path)
    print(f"Report saved successfully to: {output_path}")

if __name__ == "__main__":
    create_report()

