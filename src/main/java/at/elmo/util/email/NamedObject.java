package at.elmo.util.email;

public class NamedObject {

    private String name;
    
    private final Object object;
    
    public static NamedObject from(
            final Object object) {

        if (object instanceof NamedObject) {
            return (NamedObject) object;
        }
        
        return new NamedObject(null, object);
        
    }
    
    private NamedObject(
            final String name,
            final Object object) {
        
        this.name = name;
        this.object = object;
        
    }
    
    public NamedObject as(
            final String name) {
        
        this.name = name;
        return this;
        
    }
    
    public String getName() {
        
        if (name == null) {
            return object.getClass().getSimpleName().substring(0, 1).toLowerCase()
                    + object.getClass().getSimpleName().substring(1);
        }
        return name;
        
    }
    
    public Object getObject() {
        
        return object;
        
    }
    
}
