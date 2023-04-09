<#import "/common_de.ftlh" as common>
<@common.header title="Email-Adresse bestätigen" />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hallo ${member.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        Du musst deine Email-Adresse <i>${emailAddress}</i> bestätigen.
        Bitte trage dafür diesen Code
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.accentColor};color:#ffffff;font-size:24px" align="center">
            <b>${member.generatedEmailConfirmationCode}</b>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        in das Formular ein, in dem du deine Email-Addresse angegeben hast.
      </p>
      <p style="margin:0 0 16px 0;">
        Dein <i>${elmo.title}</i> Team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
