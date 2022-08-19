package at.elmo.util.pdf.fillin.processors;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import at.elmo.util.pdf.fillin.PdfFillInProcessor;
import at.elmo.util.pdf.fillin.Unit;
import at.elmo.util.pdf.fillin.elements.FillInElement;
import at.elmo.util.pdf.fillin.elements.TextElement;
import at.elmo.util.pdf.fillin.elements.TextElement.Font;

/**
 * Processes csv-files to generate a pdf extended by additional content.
 * 
 * @author pelikast
 */
public class CsvProcessor {
	
	/*
	 * The configuration encodign should always be UTF-8, while data encoding may vary.
	 */
	protected static final String CONFIG_ENCODING = "UTF-8";

	public static final String COLUMN_NAME_TEXT = "Inhalt";

	public static final String COLUMN_NAME_MAXSIZE = "maximaleLaenge";

	public static final String COLUMN_NAME_FONTSIZE = "Schriftgroesze";

	public static final String COLUMN_NAME_FONT = "Schriftart";

	public static final String COLUMN_NAME_Y = "Y";

	public static final String COLUMN_NAME_X = "X";

	public static final String COLUMN_NAME_PAGE = "Seite";
	
	public static final Pattern quotesAtTheBeginPattern = Pattern.compile("^(?:\"{1}|\"{3}|\"{5}|\"{7}|\"{9})");
	
	public static final Pattern quotesAtTheEndPattern = Pattern.compile("(?:\"{1}|\"{3}|\"{5}|\"{7}|\"{9})$");
	
	/**
	 * The configuration file. The configuration is read every time the
	 * process-method is called because the config-file is a template
	 * which has be to rendered using data given to the process-method.
	 */
	private File configFile;
	
	private InputStream configStream;
	
	/**
	 * Instantiates the processor with a File containing freemarker 
	 * configuration CSV data.
	 * 
	 * @param configFile
	 * @throws Exception
	 */
	public CsvProcessor(final File configFile) throws Exception {
		
		this.configFile = configFile;
				
	};
	
	/**
	 * Instantiates the processor with a InputStream containing freemarker 
	 * configuration CSV data.
	 * @param configStream The input stream.
	 */
	public CsvProcessor(final InputStream configStream) {
		
		this.configStream = configStream;
		
	}
	
	/**
	 * Processes a PDF file and fills in data according to the data and configuration
	 * CSV files. The result is stored as a separate File.
	 * @param pdf The PDF file to be populated with data.
	 * @param dataCsv The data to be substituted and inserted into the PDF.
	 * @param result The resulting PDF file.
	 * @throws Exception
	 */
	public void process(
			final File pdf,
			final File dataCsv,
			final String dataEncoding,
			final File result) throws Exception {
		
		// open original-pdf
		try (final InputStream source = new FileInputStream(pdf)) {
		
			// open output-pdf
			try (final OutputStream destination = new FileOutputStream(result)) {

				// build FillInElements
				final List<FillInElement> fillInElements = getFillInElements(dataCsv, dataEncoding);

				// merge original pdf, data and configuration 
				PdfFillInProcessor.process(source, destination, fillInElements);
				
			}
			
		}
		
	}

   public void process(
            final File pdf,
            final Map<String, Object> data,
            final String dataEncoding,
            final File result) throws Exception {
        
        // open original-pdf
        try (final InputStream source = new FileInputStream(pdf)) {
        
            // open output-pdf
            try (final OutputStream destination = new FileOutputStream(result)) {

                // build FillInElements
                final List<FillInElement> fillInElements = getFillInElements(data, dataEncoding);

                // merge original pdf, data and configuration 
                PdfFillInProcessor.process(source, destination, fillInElements);
                
            }
            
        }
        
    }

	/**
	 * Processes a PDF file and fills in data according to the data and configuration
	 * CSV InputStreams. The result is stored as a separate File.
	 * @param pdf The PDF file to be populated with data.
	 * @param csvInputStream The data to be substituted and inserted into the PDF.
	 * @param result The resulting PDF file.
	 * @throws Exception
	 */
	public void process(
			final InputStream templatePdf,
			final InputStream csvInputStream,
			final String csvEncoding, 
			final OutputStream resultStream) throws Exception {
		
			final List<FillInElement> fillInElements = 
					getFillInElements(csvInputStream, csvEncoding);
			
			PdfFillInProcessor.process(templatePdf, resultStream, fillInElements);
	}
    
    /**
     * Processes a PDF file and fills in data according to the data and configuration
     * CSV InputStreams. The result is stored as a separate File.
     * @param pdf The PDF file to be populated with data.
     * @param csvInputStream The data to be substituted and inserted into the PDF.
     * @param result The resulting PDF file.
     * @throws Exception
     */
    public void process(
            final InputStream templatePdf,
            final Map<String, Object> data,
            final String csvEncoding, 
            final OutputStream resultStream) throws Exception {
        
            final List<FillInElement> fillInElements = 
                    getFillInElements(data, csvEncoding);
            
            PdfFillInProcessor.process(templatePdf, resultStream, fillInElements);
    }
	
	/**
	 * Reads a data CSV file and returns FillInElements ready to be used by PdfFillInProcessor.
	 * @param dataCsv CSV file containing the data to be substituted and filled into the PDF.
	 * @return List of FillInElements ready to be used by PdfFillInProcessor.
	 * @throws Exception
	 */
	private List<FillInElement> getFillInElements(final File dataCsv,
			final String encoding) throws Exception {
		
		// load data-record
        final Map<String, Object> data = getData(dataCsv, encoding);
		
		return getFillInElements(data, encoding);
		
	}

	   /**
     * Reads a data CSV file and returns FillInElements ready to be used by PdfFillInProcessor.
     * @param dataCsv CSV file containing the data to be substituted and filled into the PDF.
     * @return List of FillInElements ready to be used by PdfFillInProcessor.
     * @throws Exception
     */
    private List<FillInElement> getFillInElements(
            final Map<String, Object> data,
            final String encoding) throws Exception {
        
        // load configuration-records
        
        List<Map<String, String>> config = loadConfiguration();
        
        // build TextElement-object based on configuration and current data-file
        final LinkedList<FillInElement> result = getTextElements(
                config, data);
        
        return result;
        
    }

	/**
	 * Reads a InputStream containing CSV data and returns FillInElements ready to be used by PdfFillInProcessor.
	 * @param csvInputStream CSV InputStream containing the data to be substituted and filled into the PDF.
	 * @return List of FillInElements ready to be used by PdfFillInProcessor.
	 * @throws Exception
	 */
	public List<FillInElement> getFillInElements(
			final InputStream csvInputStream,
			final String encoding) throws Exception {
		
		// load data-records
        final Map<String, Object> data = getData(csvInputStream, encoding);
		
		// load config
		List<Map<String, String>> config = loadConfiguration();
		
		// build TextElement-object based on configuration and current data-file
				final LinkedList<FillInElement> result = getTextElements(
						config, data);		
		
		return result;
	}
	
	/** Loads the configuration of freemarker template depending on the type of config
	 * the processor was instantiated by (File or InputStream).
	 * 
	 * @return List of freemarker configurations.
	 * @throws Exception 
	 */
	private List<Map<String, String>> loadConfiguration() throws Exception{

		// load configuration-records

        List<Map<String, String>> config = null;

		if (configFile == null) {

			config = readCsv(configStream, CONFIG_ENCODING);

		} else {

			config = readCsv(configFile, CONFIG_ENCODING);

		}

        return (List<Map<String, String>>) config;
	}
	
	/** Merges the configuration and data into a List of elements.
	 * 
	 * @param config PDF text element configuration List.
	 * @param data Text element data.
	 * @return List of FillInElements containing presentation and layout data.
	 * @throws Exception Thrown when freemark content processing fails.
	 */
	public LinkedList<FillInElement> getTextElements (
			final List<Map<String, String>> config,
            final Map<String, Object> data) throws Exception {
		
		final LinkedList<FillInElement> result = new LinkedList<FillInElement>();
		
		// merge data and configuration by freemarker
		
		if (config == null) {
			return result;
		}

		int lineNo = 1;
		for (final Map<String, String> elementConfiguration : config) {
			
			final TextElement textElement = getTextElement(elementConfiguration, data, lineNo);
			result.add(textElement);
			
			++lineNo;
			
		}
		
		
		
		return result;
		
	}
	
	/**
	 * Reads configuration data for CSV Text elements of a line.
	 * @param elementConfiguration Map representation of a CSV line configuration.
	 * @param data Text element data.
	 * @return TextElement representation of a PDF field.
	 * @exception Thown when an invalid data type is found in a cell.
	 */
	protected TextElement getTextElement(
			final Map<String, String> elementConfiguration,
            final Map<String, Object> data,
			final int lineNo) throws Exception{
		
		CsvTextElement result = new CsvTextElement();
		
		result.setUnit(Unit.MM);
        Object value = data.get(elementConfiguration.get(COLUMN_NAME_TEXT));
        if (value != null) {
            result.setText(value.toString());
        }
		
		String column = "";
		try {
		    
		    column = COLUMN_NAME_PAGE;
			result.setPageNumber(
					Integer.parseInt(elementConfiguration.get(COLUMN_NAME_PAGE)));
			
            column = COLUMN_NAME_X;
			result.setHorizontalPosition(
					Float.parseFloat(elementConfiguration.get(COLUMN_NAME_X)));
            column = COLUMN_NAME_Y;
			result.setVerticalPosition(
					Float.parseFloat(elementConfiguration.get(COLUMN_NAME_Y)));
	
            column = COLUMN_NAME_FONT;
			result.setFont(
					Font.valueOf(elementConfiguration.get(COLUMN_NAME_FONT)));
			
            column = COLUMN_NAME_FONTSIZE;
			result.setFontSize(
					Float.parseFloat(elementConfiguration.get(COLUMN_NAME_FONTSIZE)));
			
            column = COLUMN_NAME_MAXSIZE;
			result.setMaxLength(
					Float.parseFloat(elementConfiguration.get(COLUMN_NAME_MAXSIZE)));
			
			result.setText(elementConfiguration.get(COLUMN_NAME_TEXT));
			
		} catch (NumberFormatException e) {
			
			throw new Exception(
			        "Line "
			        + lineNo
			        + ": For the configuration column '"
			        + column
					+ "' a number is expected.", e);
			
		}
		
		return result;
		
	}
	
	/**
	 * Reads the CSV data file with the data to be filled in the PDF.
	 * @param dataCsv CSV data file.
	 * @return Map of the datafile with [header]:[value] key-pairs.
	 * @throws Exception Thrown when data file contains no data or more than one row.
	 */
    private Map<String, Object> getData(
			final File dataCsv,
			final String encoding) throws Exception {
		
        Map<String, Object> data = null;
		try(final InputStream csvInputStream = new FileInputStream(dataCsv)) {
			
			data = getData(csvInputStream, encoding);
				
		}
		
		return data;
		
	}
	
	/**
	 * Reads the CSV InputStream with the data to be filled in the PDF.
	 * @param csvInputStream CSV data InputStream.
	 * @return Map of the data with [header]:[value] key-pairs.
	 * @throws Exception Thrown when data stream contains no data or more than one row.
	 */
    private Map<String, Object> getData(
			final InputStream csvInputStream,
			final String encoding) throws Exception {

        final List<Map<String, String>> data = readCsv(csvInputStream, encoding);

		// data has to consist of only one record
		if ((data == null) || (data.size() > 1)) {

			throw new Exception("There is no or more than one record in data CSV");

		}
		
		final Map<String, Object> result = new HashMap<>();
		data
		        .get(0)
		        .forEach((key, value) -> result.put(key, value));
		return result;

	}
	
	/**
	 * Read a CSV File and store it into a List of Maps each Map containing the headers
	 * along with the lines cell values.
	 * @param csvFile The CSV file.
	 * @return List of Maps each Map containing the headers along with the lines cell values.
	 * @throws Exception
	 */
    public static List<Map<String, String>> readCsv(
			final File csvFile,
			final String encoding) throws Exception {
		
        List<Map<String, String>> result = null;
		
		try (final FileInputStream inputStream = new FileInputStream(csvFile)) {
			
			result = readCsv(inputStream, encoding);
			
		}
		
		return result;
		
	}
	
	/**
	 * Read a CSV InputStream and store it into a List of Maps each Map containing the headers
	 * along with the lines cell values.
	 * @param csvFile The CSV file.
	 * @return List of Maps each Map containing the headers along with the lines cell values.
	 * @throws Exception
	 */
    public static List<Map<String, String>> readCsv(
			final InputStream inputStream,
			final String encoding) throws Exception{
		
        final LinkedList<Map<String, String>> result = new LinkedList<Map<String, String>>();
		
		try (final BufferedReader reader = 
				new BufferedReader(new InputStreamReader(inputStream, encoding))) {
		
			List<String> headers = null;
			
			boolean firstLine = true;
			while (reader.ready()) {
				
				final String line = reader.readLine();
				
				if (firstLine) {
					
					headers = processCsvLine(line, true);
					
					firstLine = false;
					
				} else {
					
                    final Map<String, String> data = processCsvLine(headers, line);
					
					result.add(data);
	
				}
				
			}
		
		}
		
		return result;
		
	}
	
	/**
	 * Combine a line from a CSV file and its headers into a Map.
	 * @param headers CSV file headers.
	 * @param line Line from the CSV file.
	 * @return Map with key-value pairs [column-name]:[cell-value].
	 */
    private static Map<String, String> processCsvLine(
			final List<String> headers,
			final String line) {

        final HashMap<String, String> result = new HashMap<String, String>();
		
		final List<String> lineData = processCsvLine(line, false);
		
		int currentIndex = 0;
		while (currentIndex < headers.size()) {

			final String key = headers.get(currentIndex);
			
			if (currentIndex < lineData.size()) {
				
				final String value = lineData.get(currentIndex);
				
				result.put(key, value);
				
			} else {
				
				result.put(key, "");
				
			}
			
			++currentIndex;
			
		}
		
		return result;
		
	}
	
	/**
	 * Processes a line from a CSV file and returns a List with the cell values.
	 * @param line The CSV line.
	 * @param isHeaderLine Whether this line contains headers. Results in removing whitespace and replacing &quot;-&quot; by &quot;_&quot;
	 * @return List of cell values from CSV file.
	 */
	private static List<String> processCsvLine(final String line, final boolean isHeaderLine) {
		
		if (line == null) {
			return null;
		}
		
		final LinkedList<String> result = new LinkedList<String>();
		
		final String[] cells = line.split(";");
		boolean inQuotes = false;
		
		StringBuilder cellBuilder = new StringBuilder();
		
		for (final String cell : cells) {
			
			boolean commonQuotedCell
					= !inQuotes && cell.startsWith("\"") && cell.endsWith("\"") && (cell.length() > 1);
			boolean startsWithQuotes
					= quotesAtTheBeginPattern.matcher(cell).find();
			boolean endsWithQuotes
					= quotesAtTheEndPattern.matcher(cell).find();
			
			final String cellValue;
			if (commonQuotedCell) {
				
				final String cellWithoutQuotes = cell.substring(1, cell.length() - 1);
				final String cellWithCorrectInnerQuotes = cellWithoutQuotes.replaceAll("\"\"", "\"");
				
				cellValue = cellWithCorrectInnerQuotes;
				
			} else if (inQuotes) {
				
				final String cellWithoutQuotes = cell.substring(1);
				final String cellWithCorrectInnerQuotes = cellWithoutQuotes.replaceAll("\"\"", "\"");

				cellBuilder.append(cellWithCorrectInnerQuotes);
				
				if (endsWithQuotes) {
					
					cellValue = cellBuilder.toString();
					
					cellBuilder = new StringBuilder();
					
					inQuotes = false;
					
				} else {
					
					cellBuilder.append(';');
					cellValue = null;
					
				}
				
			} else {
				
				if (startsWithQuotes) {
					
					final String cellWithoutQuotes = cell.substring(1);
					final String cellWithCorrectInnerQuotes = cellWithoutQuotes.replaceAll("\"\"", "\"");
					
					cellBuilder.append(cellWithCorrectInnerQuotes);
					cellBuilder.append(';');
					
					cellValue = null;
					
					inQuotes = true;
					
				} else {
				
					cellValue = cell;
					
				}
				
			}
			
			if (cellValue != null) {
				
				final String finalValue = formatCellValue(isHeaderLine,
						cellValue);
				
				result.add(finalValue);
				
			}
			
		}
		
		if (cellBuilder.length() > 0) {
			
			final String tmpValue =  cellBuilder.toString();
			
			final String finalValue = formatCellValue(isHeaderLine, tmpValue);
			
			result.add(finalValue);
			
		}
		
		return result;
		
	}

	public static String formatCellValue(final boolean isHeaderLine,
			final String cellValue) {
		
		final String finalValue;
		if (! isHeaderLine) {
			
			finalValue = cellValue;
			
		} else {
			
			final String valueWithoutWhitespace = cellValue.replaceAll("\\s", "");
			final String valueWithoutMinus = valueWithoutWhitespace.replaceAll("-", "_");
			// Once the opportunity presents itself, move the freemarker related substitutions to the FreemarkerCsvProcessor
			final String cellWithoutFreemarkerOperands = valueWithoutMinus.replaceAll("\\.", "");
			final String valueWithoutSpecialCharacters = cellWithoutFreemarkerOperands
					.replaceAll("ü", "ue")
					.replaceAll("Ü", "Ue")
					.replaceAll("ä", "ae")
					.replaceAll("Ä", "Ae")
					.replaceAll("ö", "oe")
					.replaceAll("Ö", "Oe")
					.replaceAll("ß", "sz");
			
			finalValue = valueWithoutSpecialCharacters;
			
		}
		
		return finalValue;
		
	}

}
