<#import "/common_de.ftlh" as common>
<@common.header title="Deine Anmeldung ist noch unvollständig!" />
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
        Damit du Fahrten buchen kannst und wir dich dann mit unseren Elektroautos mitnehmen
        können, <b>bitten wir dich die Registrierung abzuschließen</b>.
      </p>
      <p style="margin:0 0 16px 0;">
        Bitte rufe dafür die Seite <a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}">${elmo.gatewayUrl}</a>
        in deinem Browser auf und melde dich erneut an. Es erscheint sofort das Formular
        mit einem Hinweis welche Daten noch fehlen oder klicke die blauen Taste an:
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.accentColor};color:#ffffff;font-size:24px" align="center">
            <a style="color:#ffffff;text-decoration:none;" href="${elmo.gatewayUrl?no_esc}"><b>Registrierung abschließen</b></a>
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
