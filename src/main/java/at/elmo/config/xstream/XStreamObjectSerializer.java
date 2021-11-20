package at.elmo.config.xstream;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.charset.Charset;
import java.util.Date;
import java.util.List;

import javax.xml.stream.XMLStreamException;
import javax.xml.stream.XMLStreamWriter;

import org.camunda.bpm.engine.impl.util.ReflectUtil;
import org.camunda.bpm.engine.impl.variable.serializer.AbstractObjectValueSerializer;

import com.thoughtworks.xstream.XStream;
import com.thoughtworks.xstream.converters.Converter;
import com.thoughtworks.xstream.io.xml.StaxDriver;
import com.thoughtworks.xstream.io.xml.StaxWriter;

public class XStreamObjectSerializer extends AbstractObjectValueSerializer {

    public static final String NAME = "xstream";
    public static final String DATAFORMAT = "application/xstream";

    private final Charset charset;
    
    private List<String> converters;
    
    private List<String> allowedTypes;
    
    public XStreamObjectSerializer(final String encoding,
    		final List<String> converters,
    		final List<String> allowedTypes) {
        super(DATAFORMAT);
        this.charset = Charset.forName(encoding);
        this.converters = converters;
        this.allowedTypes = allowedTypes;
    }

    @Override
    protected boolean isSerializationTextBased() {
        return true;
    }

    @Override
    public String getName() {
        return NAME;
    }

    // support old camunda engine
    protected boolean canSerializeObject(final Object value) {
    	
    	// see https://docs.camunda.org/manual/7.8/user-guide/process-engine/variables/#supported-variable-values    	
        if (value == null) {
            return false;
        } else if (value.getClass().isPrimitive()) {
        	return false;
        } else if (value instanceof Number) {
            return false;
        } else if (value instanceof String) {
            return false;
        } else if (value instanceof Boolean) {
            return false;
        } else if (value instanceof Character) {
            return false;
        } else if (value instanceof Date) {
        	return false;
        }
        return true;

    }

    @Override
    protected boolean canSerializeValue(final Object value) {
        return canSerializeObject(value);
    }

    @Override
    protected String getTypeNameForDeserialized(final Object deserializedObject) {
        return deserializedObject.getClass().getName();
    }

    @Override
    protected Object deserializeFromByteArray(final byte[] object, final String objectTypeName) throws Exception {
        final ByteArrayInputStream in = new ByteArrayInputStream(object);
        final InputStreamReader reader = new InputStreamReader(in, charset);
        return getXStream().fromXML(reader);
    }

    @Override
    protected byte[] serializeToByteArray(final Object deserializedObject) throws Exception {
        final ByteArrayOutputStream out = new ByteArrayOutputStream();
        final OutputStreamWriter writer = new OutputStreamWriter(out, charset);
        getXStream().toXML(deserializedObject, writer);
        return out.toByteArray();
    }

    private XStream getXStream() {
        final StaxDriver staxDriver = new StaxDriver() {
            @Override
            public StaxWriter createStaxWriter(final XMLStreamWriter out) throws XMLStreamException {
                // the boolean parameter controls the production of XML
                // declaration
                return createStaxWriter(out, false);
            }
        };
        XStream result = new XStream(staxDriver);
        result.setMode(XStream.ID_REFERENCES); // no xpath, just ids
        result.setClassLoader(ReflectUtil.getClassLoader()); // use isolated
                                                             // class loader
        result.ignoreUnknownElements();
        registerConverters(result);
        setupSecurity(result);
        return result;
    }

	private void setupSecurity(final XStream result) {
        for (final String allowedType : allowedTypes) {
        	final String trimmedAllowedType = allowedType.trim();
        	if (trimmedAllowedType.startsWith("/") && trimmedAllowedType.endsWith("/")) {
        		addTypesByRegExp(result, trimmedAllowedType);
        	}
        	else if (trimmedAllowedType.startsWith("<")) {
        		addTypeHierarchy(result, trimmedAllowedType);
        	}
        	else if (trimmedAllowedType.contains("*")) {
        		addTypesByWildfcard(result, trimmedAllowedType);
        	}
        	else {
        		addType(result, trimmedAllowedType);
        	}
        }
	}
	
	private void addType(final XStream result, final String allowedType) {
		if ((allowedType == null) || allowedType.isEmpty()) {
			return;
		}
		result.allowTypes(new String[] { allowedType });
	}

	private void addTypesByWildfcard(final XStream result, final String wildcardPattern) {
		if ((wildcardPattern == null) || wildcardPattern.isEmpty()) {
			return;
		}
		result.allowTypesByWildcard(new String[] { wildcardPattern });
	}

	private void addTypeHierarchy(final XStream result, final String allowedType) {
		if ((allowedType == null) || allowedType.isEmpty()) {
			return;
		}
		final Class<?> clasz = ReflectUtil.loadClass(allowedType.substring(1));
		result.allowTypeHierarchy(clasz);
	}

	private void addTypesByRegExp(final XStream result, final String regexp) {
		if ((regexp == null) || regexp.isEmpty()) {
			return;
		}
		result.allowTypesByRegExp(new String[] { regexp.substring(1, regexp.length() - 1) });
	}

	private void registerConverters(XStream result) {
		for (final String converterClassName : converters) {
        	try {
        		if (converterClassName == null) {
        			continue;
        		}
        		final String trimmedConverterClassName = converterClassName.trim();
        		if (trimmedConverterClassName.isEmpty()) {
        			continue;
        		}
	        	final Class<?> converterClass = ReflectUtil.getClassLoader().loadClass(
	        			trimmedConverterClassName);
	        	final Converter converter = (Converter) converterClass.getDeclaredConstructor().newInstance();
	        	result.registerConverter(converter);
        	} catch (Exception e) {
        		throw new RuntimeException("Could not register converter '"
        				+ converterClassName + "'", e);
        	}
        }
	}

}
