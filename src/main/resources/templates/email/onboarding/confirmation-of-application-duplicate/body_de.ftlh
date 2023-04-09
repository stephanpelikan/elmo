<#import "/common_de.ftlh" as common>
<@common.header title="Deine Anmeldung ist nun freigeschaltet!" />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hallo ${memberApplication.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        Du hast dich beim klimafreundlichen Fahrtendienst &quot;<i>${elmo.title}</i>&quot;
        registriert. Danke dafür!
      </p>
      <p style="margin:0 0 16px 0;">
        <b>Deine Elmo-Anmeldung ist nun freigeschaltet!</b>
        Du kannst den Dienst jetzt nutzen.
        Rufe dafür <b><a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}">${elmo.gatewayUrl}</a></b> in deinem Browser
        auf und melde dich erneut an.
      </p>
      <p style="margin:0 0 16px 0;">
        Solltest du Buchungen telefonisch unter ${elmo.phoneNumber} abwickeln, dann
        halte bitte deine Mitgliedsnummer bereit!
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.accentColor};color:#ffffff;font-size:24px" align="center">
            <b>Mitgliedsnummer: ${memberApplication.memberId!"-"}</b>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        Dein <i>${elmo.title}</i> Team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
