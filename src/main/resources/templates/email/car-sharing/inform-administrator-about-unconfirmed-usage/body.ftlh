<#import "/common_de.ftlh" as common>
<@common.header title="Usage of car-sharing was not confirmed" internal=true />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hello ${member.firstName!""}!</i>
      </p>
      <p style="margin:0 0 16px 0;">
        In your role as an administrator you get informed about a Car-Sharing
        that was not confirmed in the App after use!
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
                <b>${carSharing.driver.memberId!"-"}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Name:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${carSharing.driver.firstName!""} ${carSharing.driver.lastName!""}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Car:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${carSharing.car.name!""}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                From:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${(carSharing.startsAt).format("MEDIUM_DATETIME")}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                To:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${(carSharing.endsAt).format("MEDIUM_DATETIME")}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Hours:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${carSharing.hoursPlanned!""}</b>
              </td>
            </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  <tr>
    <td style="padding:0;">
      <p style="margin:16px 0 16px 0;">
        Yuur <i>${elmo.title}</i> team
      </p>
    </td>
  </tr>
</table>
<@common.footer internal=true />
