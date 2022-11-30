package at.elmo.util.mapper;

import org.openapitools.jackson.nullable.JsonNullable;

public abstract class MapperBase {

    public JsonNullable<String> toApi(String value) {
        return JsonNullable.of(value);
    }
    
    public String toDomain(JsonNullable<String> value) {
        if ((value == null)
                || !value.isPresent()) {
            return null;
        }
        return value.get();
    }
    
}
