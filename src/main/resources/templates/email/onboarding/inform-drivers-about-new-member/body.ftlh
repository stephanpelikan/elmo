<#import "/common_de.ftlh" as common>
<@common.header title="A new member!" internal=true />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hello ${driver.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        In your role as a driver we inform you about a new
        member has joined recently!
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0" align="center">
      <table role="presentation" style="border-collapse:collapse;border:0;border-spacing:0;">
        <tr>
          <td style="padding:16px;background:${elmo.brandColor};color:#444444;font-size:24px" align="center">
            <table role="presentation" style="mso-line-height-rule:exactly;line-height:16px;padding:0;border-collapse:collapse;border:0;border-spacing:0;">
            <tr>
              <td style="padding:4px;color:#444444;">
                Membership number:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${memberApplication.memberId!"-"}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Name:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${memberApplication.firstName!""} ${memberApplication.lastName!""}</b>
              </td>
            </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        For details about the new member please go to
        <a style="color:${elmo.brandColor};text-decoration:underline;" href="${elmo.gatewayUrl?no_esc}">${elmo.gatewayUrl}</a>.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        Your <i>${elmo.title}</i> team
      </p>
    </td>
  </tr>
</table>
<@common.footer internal=true />
