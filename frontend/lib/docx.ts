import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'
import { AssignmentDetail } from '@/types/assignment'

const FONT = 'Calibri'

function noBorder() {
  const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
  return { top: none, bottom: none, left: none, right: none }
}

export async function downloadAsDocx(
  assignment: AssignmentDetail
): Promise<{ success: boolean; error?: string }> {
  if (!assignment.generatedContent) {
    return { success: false, error: 'No generated content available' }
  }

  const { sections, totalMarks, timeAllowed } = assignment.generatedContent

  try {
    const children: (Paragraph | Table)[] = []

    // ── Title block ──────────────────────────────────────────────
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: assignment.name || 'Question Paper',
            bold: true,
            size: 32,
            font: FONT,
          }),
        ],
      })
    )

    // Subject / Class / Marks / Time info line
    const infoLine = [
      `Subject: ${assignment.subject}`,
      `Class: ${assignment.className}`,
      `Total Marks: ${totalMarks}`,
      `Time: ${timeAllowed} min`,
    ].join('   |   ')

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({ text: infoLine, size: 20, font: FONT, color: '555555' }),
        ],
      })
    )

    // Divider
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } },
        children: [new TextRun({ text: '', size: 4 })],
      })
    )

    // ── Sections ─────────────────────────────────────────────────
    let globalQ = 1
    for (const section of sections) {
      // Section title
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 80 },
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 26,
              font: FONT,
            }),
          ],
        })
      )

      // Section instruction
      if (section.instruction) {
        children.push(
          new Paragraph({
            spacing: { after: 140 },
            children: [
              new TextRun({
                text: section.instruction,
                italics: true,
                size: 20,
                font: FONT,
                color: '666666',
              }),
            ],
          })
        )
      }

      // Questions
      for (const q of section.questions) {
        // Question text
        children.push(
          new Paragraph({
            spacing: { before: 160, after: 60 },
            children: [
              new TextRun({
                text: `Q${globalQ}. `,
                bold: true,
                size: 22,
                font: FONT,
              }),
              new TextRun({
                text: q.text,
                size: 22,
                font: FONT,
              }),
              new TextRun({
                text: `  [${q.marks} mark${q.marks > 1 ? 's' : ''}]`,
                size: 18,
                font: FONT,
                color: '888888',
              }),
            ],
          })
        )

        // MCQ options as a 2×2 table
        if (q.options && q.options.length > 0) {
          const optionLabels = ['A', 'B', 'C', 'D']
          const rows: TableRow[] = []
          for (let r = 0; r < q.options.length; r += 2) {
            const cells: TableCell[] = []
            for (let c = 0; c < 2; c++) {
              const idx = r + c
              cells.push(
                new TableCell({
                  borders: noBorder(),
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  shading: { type: ShadingType.CLEAR, fill: 'FFFFFF' },
                  children: [
                    new Paragraph({
                      spacing: { before: 20, after: 20 },
                      children: idx < q.options.length
                        ? [
                            new TextRun({
                              text: `  ${optionLabels[idx]}) ${q.options[idx]}`,
                              size: 20,
                              font: FONT,
                            }),
                          ]
                        : [],
                    }),
                  ],
                })
              )
            }
            rows.push(new TableRow({ children: cells }))
          }
          children.push(
            new Table({
              rows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          )
        }

        globalQ++
      }
    }

    // ── Answer Key ────────────────────────────────────────────────
    children.push(
      new Paragraph({
        spacing: { before: 400 },
        pageBreakBefore: true,
        children: [],
      })
    )
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'ANSWER KEY',
            bold: true,
            size: 30,
            font: FONT,
          }),
        ],
      })
    )

    let ansQ = 1
    for (const section of sections) {
      for (const q of section.questions) {
        children.push(
          new Paragraph({
            spacing: { before: 80, after: 60 },
            children: [
              new TextRun({
                text: `Q${ansQ}. `,
                bold: true,
                size: 20,
                font: FONT,
              }),
              new TextRun({
                text: q.answerKey || 'N/A',
                size: 20,
                font: FONT,
              }),
            ],
          })
        )
        ansQ++
      }
    }

    // Build doc
    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: { top: 720, bottom: 720, left: 900, right: 900 },
            },
          },
          children,
        },
      ],
    })

    const blob = await Packer.toBlob(doc)
    const filename = `${(assignment.name || 'paper').replace(/\s+/g, '_')}.docx`
    saveAs(blob, filename)

    return { success: true }
  } catch (err) {
    console.error('DOCX generation error:', err)
    return { success: false, error: 'Could not generate Word document.' }
  }
}
