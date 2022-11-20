package at.elmo.util.pdf.fillin;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.LinkedList;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.PDPageContentStream.AppendMode;
import org.apache.pdfbox.pdmodel.common.PDRectangle;

import at.elmo.util.pdf.fillin.elements.FillInElement;
import at.elmo.util.pdf.fillin.handlers.Handler;

/**
 * Utility to add content to an existing PDF-file.
 * 
 * @see PdfFillInProcessor#process(InputStream, OutputStream, List)
 * @author pelikast
 */
public class PdfFillInProcessor {

    /**
     * Reads a PDF-file from the given source-stream and writes the result
     * to the given destination-stream.
     * 
     * @param source The source InputStream
     * @param destination The destination OutputStream
     * @param fillInElements Elements to be processed
     * @throws IOException
     */
    public static void process(
            final InputStream source,
            final OutputStream destination,
            final List<FillInElement> fillInElements) throws IOException {
        
        // open source-document
        try (final PDDocument sourceDocument = PDDocument.load(source)) {
        
            // create destination-document
            try (final PDDocument result = new PDDocument()) {
            
                // process all pages
                final Iterable<PDPage> allPages = (Iterable<PDPage>) sourceDocument
                        .getDocumentCatalog()
                        .getPages();
                
                int currentPageNumber = 1;
                for (final PDPage page : allPages) {
                    
                    final PDPage newPage = processElements(result,
                            page, currentPageNumber, fillInElements);
                    
                    result.addPage(newPage);
                    
                    ++currentPageNumber;
                    
                }
            
                // save result
                try {
                    
                    result.save(destination);
                    
                } catch (Exception e) {
                    
                    throw new IOException(
                            "Could not save new pdf-document", e);
                    
                }
                
            }
            
        }
        
    }
    
    /**
     * @param originalPage The original PDF-page
     * @param currentPageNumber The number of the PDF-page within the PDF-file 
     * @param fillInElements Elements to be processed
     * @return A new PDF-page or the original if no processing is necessary
     */
    private static PDPage processElements(
            final PDDocument document,
            final PDPage originalPage,
            final int currentPageNumber,
            final List<FillInElement> fillInElements) throws IOException {
        
        // any elements present?
        if ((fillInElements == null)
                || (fillInElements.size() == 0)) {
            
            return originalPage;
            
        }
        
        // any elements for the current page present?
        final List<FillInElement> pageElements
                = filterElements(currentPageNumber, fillInElements);
        if ((pageElements == null)
                || (pageElements.size() == 0)) {
            
            return originalPage;
            
        }
        
        // process elements
        final PDPage newPage = createPage(document, originalPage,
                pageElements);
        
        return newPage;
        
    }
    
    /**
     * Filter given elements to those matching the given page-number.
     * 
     * @param currentPageNumber The desired page-number.
     * @param fillInElements All elements
     * @return All elements matching the desired page-number.
     */
    private static List<FillInElement> filterElements(
            final int currentPageNumber,
            final List<FillInElement> fillInElements) {
        
        final LinkedList<FillInElement> result = new LinkedList<FillInElement>();
        
        for (final FillInElement fillInElement : fillInElements) {
            
            if (fillInElement.getPageNumber() == currentPageNumber) {
                
                result.add(fillInElement);
                
            }
            
        }
        
        return result;
        
    }

    /**
     * @param originalPage The original PDF-page
     * @param fillInElements Elements to be processed
     * @return A new PDF-page containing the new content defined by the given elements
     */
    private static PDPage createPage(
            final PDDocument document,
            final PDPage originalPage,
            final List<FillInElement> fillInElements) throws IOException {
        
        // build a copy of the original page
        final PDPage page = new PDPage(originalPage.getCOSObject());
        //final PDPage page = new PDPage(originalPage.getCropBox());
        final PDRectangle mediaBox = page.getMediaBox();
        
        // open drawable context
        try (final PDPageContentStream contentStream = new PDPageContentStream(
                document, page, AppendMode.APPEND, true, true)) {
            
            // insert original page as image
            /*
            final BufferedImage pageAsImage = originalPage.convertToImage(BufferedImage.TYPE_INT_RGB, 150);
            final PDJpeg pageAsJpg = new PDJpeg(document,  pageAsImage);
            pageAsJpg.setWidth((int) originalPage.getCropBox().getWidth());
            pageAsJpg.setHeight((int) originalPage.getCropBox().getHeight());
            contentStream.drawImage(pageAsJpg, 0, 0);
            */
        
            // and add the elements
            for (final FillInElement fillInElement : fillInElements) {
                
                // ignore null-elements
                if (fillInElement == null) {
                    continue;
                }
                
                // find a proper handler
                final Handler handler = getHandler(fillInElement);
                
                // process element
                handler.process(mediaBox, contentStream, fillInElement);
                
            }
            
        }
        
        return page;
        
    }
    
    /**
     * Finds a proper handler for the given element.
     * 
     * @param element The element
     * @return A handler
     */
    private static Handler getHandler(final FillInElement element) {
        
        /*
         *  find special interface (subinterfacing FillInElement) implemented by element
         *  and extract simpleName of that interface.
         */
        String className = null;
        final Class<?>[] interfaces = element.getClass().getInterfaces();
        for (final Class<?> implementingInterface : interfaces) {
            
            // ignore situation "class xxx implements FillInElement { " 
            if (implementingInterface.equals(FillInElement.class)) {
                continue;
            }
            
            // check whether current interface is subinterfacing FillInElement
            if (FillInElement.class.isAssignableFrom(implementingInterface)) {
                
                // already found an interface? throw useful exception
                if (className != null) {
                    
                    throw new RuntimeException(
                            "Element of class '"
                            + element.getClass().getCanonicalName()
                            + "' implements more than one interface subinterfacing '"
                            + FillInElement.class.getCanonicalName()
                            + "'. Only one interface is valid!");
                    
                }
                // otherwise save simple name for further processing
                else {
                    
                    className = implementingInterface.getSimpleName();
                    
                }
                
            }
            
        }
        
        // if no proper interface was found then throw a useful exception
        if (className == null) {
            
            throw new RuntimeException(
                    "Element of class '"
                    + element.getClass().getCanonicalName()
                    + "' implements no interface subinterfacing '"
                    + FillInElement.class.getCanonicalName()
                    + "'.");
            
        }
        
        // construct class name of handler matching the found interface
        final String handlerPackageName = Handler.class.getPackage().getName();
        final String handlerClassName = handlerPackageName + "." + className + "Handler";
        
        // build new instance using default-constructor
        try {
            
            @SuppressWarnings("unchecked")
            final Class<? extends Handler> handlerClass =
                    (Class<? extends Handler>) Handler.class.getClassLoader()
                    .loadClass(handlerClassName);
            
            return handlerClass.getConstructor().newInstance();
            
        } catch (Exception e) {
            
            throw new RuntimeException(
                    "Unknown handler '"
                    + handlerClassName
                    + "'", e);
            
        }
        
    }
    
}
