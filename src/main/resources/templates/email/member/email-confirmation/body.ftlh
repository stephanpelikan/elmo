<#import "/common_de.ftlh" as common>
<@common.header title="Email-address confirmation" />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hello ${member.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        You need to confirm your email-address <i>${emailAddress}</i>. To do so, please enter the code
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
         into the form in which you entered your email-address.
      </p>
      <p style="margin:0 0 16px 0;">
        Your <i>${elmo.title}</i> team
      </p>
    </td>
  </tr>
</table>
<@common.footer />
