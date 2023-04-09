<#import "/common_de.ftlh" as common>
<@common.header title="Email-Bestätigung" internal=true />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hallo ${driver.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        In der kommenden Woche gibt es noch unbesetzte Schichten:
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0 0 16px 0;" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
      <tr>
        <#list days as day>
          <td style="width:40px;background:#b4b4b4;padding:4px 2px 2px 2px;color:#333333;" align="center">
            <b>
              <#if day.dayOfWeek == "SUNDAY">
                So
              <#elseif day.dayOfWeek == "MONDAY">
                Mo
              <#elseif day.dayOfWeek == "TUESDAY">
                Di
              <#elseif day.dayOfWeek == "WEDNESDAY">
                Mi
              <#elseif day.dayOfWeek == "THURSDAY">
                Do
              <#elseif day.dayOfWeek == "FRIDAY">
                Fr
              <#else>
                Sa
              </#if>
            </b>
          </td>
          <#if !day?is_last>
            <td style="width:4px;background:#b4b4b4;padding:0;" align="center">
              &nbsp;
            </td>
          </#if>
        </#list>
      </tr>
      <tr>
        <#list days as day>
          <td style="width:40px;background:#b4b4b4;padding:2px;color:#333333;" align="center">
            ${day.dayOfMonth}.
          </td>
          <#if !day?is_last>
            <td style="width:4px;background:#b4b4b4;padding:0;" align="center">
              &nbsp;
            </td>
          </#if>
        </#list>
      </tr>
      <#list hours as hour,days>
        <tr height="10">
          <#list days as day>
            <#if !day??>
            <#elseif day.status != "NO_SHIFT">
              <td align="center" style="padding:2px 0 0 0;background:<#if day.status == "FREE">#ff4040;<#elseif day.status == "PARTIAL">#ffaa15<#else>#00c781</#if>;color:<#if day.status == "FREE">#ffffff;<#elseif day.status == "PARTIAL">#444444<#else>#444444</#if>;vertical-align:top;" rowspan="${day.durationInHours}">
                <a href="${elmo.gatewayUrl?no_esc}/fahrer/planer?${(day.startsAt).format("ISO_LOCAL_DATE")}_${day.carId}_${day.description}" style="white-space:nowrap;color:<#if day.status == "FREE">#ffffff;<#elseif day.status == "PARTIAL">#444444<#else>#444444</#if>;text-decoration:none;">${day.description}</a>
              </td>
            <#else>
              <td style="padding:0;background:#dadada;"></td>
            </#if>
            <#if !day?is_last>
              <td style="width:4px;background:#b4b4b4;padding:0;"></td>
            </#if>
          </#list>
        </tr>
      </#list>
      </table>
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
      <tr>
        <td style="padding:4px;">
          <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
          <tr>
            <td width="14" height="14" style="padding:0;background:#00c781;"></td>
            <td style="padding:0px 0px 0px 4px;font-size:14px;">Mit Fahrer</td>
          </tr>
          </table>
        </td>
        <#if hasPartials == true>
          <td style="padding:4px;">
            <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
            <tr>
              <td width="14" height="14" style="padding:0;background:#ffaa15;"></td>
              <td style="padding:0px 0px 0px 4px;font-size:14px;">Teilweise</td>
            </tr>
            </table>
          </td>
        </#if>
        <td style="padding:4px;">
          <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
          <tr>
            <td width="14" height="14" style="padding:0;background:#ff4040;"></td>
            <td style="padding:0px 0px 0px 4px;font-size:14px;">Offen</td>
          </tr>
          </table>
        </td>
      </tr>
      </table>
      <p style="padding:0;font-size:14px;margin:0;">
         (Klicke eine Schicht an, um in die App einzusteigen)
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        Bitte <b><a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}/fahrer">trage dich ein</a></b>,
        wenn du eine dieser Schichten fahren kannst.
      </p>
      <p style="margin:0 0 16px 0;">
        <b>Danke!</b>
      </p>
      <p style="margin:0 0 16px 0;">
        Dein <i>${elmo.title}</i> Team
      </p>
    </td>
  </tr>
</table>
<@common.footer internal=true />
