import { readFileSync } from "fs";
import { DocxCounter, OdtCounter, PdfCounter, PptxCounter } from "page-count";
import path from "path";

async function countPages(filePath) {
  const ext = path.extname(filePath).toLowerCase();  // Get file extension
  let buffer = readFileSync(filePath);
  let pageCount;

  try {
    switch (ext) {
      case ".docx":
        pageCount = await DocxCounter.count(buffer);
        break;
      case ".pdf":
        pageCount = await PdfCounter.count(buffer);
        break;
      case ".odt":
        pageCount = await OdtCounter.count(buffer);
        break;
      case ".pptx":
        pageCount = await PptxCounter.count(buffer);
        break;
      default:
        throw new Error("Unsupported file type");
    }
    console.log(`Pages counted successfully: ${pageCount}`);
  } catch (error) {
    console.error("Error counting pages:", error.message);
  }
}

countPages("/Users/harshavardhan/Documents/PPSresume/2018.docx");
