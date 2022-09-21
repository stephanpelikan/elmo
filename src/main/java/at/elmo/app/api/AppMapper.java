package at.elmo.app.api;

import at.elmo.app.api.v1.TextMessage;
import at.elmo.util.sms.Sms;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public abstract class AppMapper {

    @Mapping(target = "recipient", source = "recipientNumber")
    public abstract TextMessage toApi(Sms sms);

    public abstract List<TextMessage> toTextMessageApi(List<Sms> sms);

}
