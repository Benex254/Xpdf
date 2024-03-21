const pageCurrent = document.getElementById("page");
const pageCount = document.getElementById("pageCount");

const url = "./What does 1.5C mean in a warming world_.pdf";


// const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function modifyPdf() {
  // Load an existing PDF document
  const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);

  // Embed the Helvetica font
  const helveticaFont = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);

  // Get the first page of the document
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Draw the text
  const text = "BenedictXavier is awesome";
  const textSize = 12;
  const textWidth = helveticaFont.widthOfTextAtSize(text, textSize);
  const textHeight = helveticaFont.heightAtSize(textSize);
  const textX = 50; // X coordinate
    const textY = 700; // Y coordinate
  
  // Draw the rectangle
  firstPage.drawRectangle({
    x: textX - 5,
    y: textY - 5,
    width: textWidth + 10,
    height: textHeight + 10,
    borderColor: PDFLib.rgb(1, 0, 0),
    color: PDFLib.rgb(0.5, 0.6, 0.3),
    borderWidth: 1,
  });
  
    firstPage.drawText(text, {
      x: textX,
      y: textY,
      size: textSize,
      font: helveticaFont,
      color: PDFLib.rgb(0, 0, 0),
    });

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes
  // Use the bytes to render or save the PDF
}

pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.js";

let pdf = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 1.5;
const canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d");

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
const renderPage = (num) => {
  pageRendering = true;
  // Using promise to fetch the page
  pdf.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
    pageCurrent.textContent = num;
    pageCount.textContent = pdf.numPages;
    window.scrollTo(0, 0);
  });
};

const queueRenderPage = (num) => {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

const PrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};
document.getElementById("prev").addEventListener("click", PrevPage);

const NextPage = () => {
  if (pageNum >= pdf.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};
document.getElementById("next").addEventListener("click", NextPage);

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "n") {
    NextPage();
  } else if (e.key === "ArrowLeft" || e.key === "p") {
    PrevPage();
  }
});

modifyPdf().then((pdfBytes) => {
  pdfjsLib.getDocument({ data: pdfBytes }).promise.then((pdf_) => {
    pdf = pdf_;
    pageCount.textContent = 1;
    pageCount.textContent = pdf.numPages;
    renderPage(pageNum);
  });
});
