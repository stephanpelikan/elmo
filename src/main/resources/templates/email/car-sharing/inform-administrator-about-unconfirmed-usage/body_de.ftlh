<#import "/common_de.ftlh" as common>
<@common.header title="Car-Sharing-Nutzung wurde nicht bestätigt" internal=true />
<table role="presentation" style="width:100%;border-collapse:collapse;border:0;border-spacing:0;">
  <tr>
    <td style="padding:0;">
      <p style="margin:0 0 16px 0;">
        <i>Hallo ${member.firstName!""}!</i>
      </p>
      <p style="margin:0px 0 16px 0;">
        In deiner Rolle als Administrator wirst du informiert, dass ein Car-Sharing
        nach der Nutzung nicht in der App bestätigt wurde!
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
                Mitgliedsnummer:
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
                Fahrzeug:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${carSharing.car.name!""}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Von:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${(carSharing.startsAt).format("MEDIUM_DATETIME")}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Bis:
              </td>
              <td style="padding:4px;color:#444444;">
                <b>${(carSharing.endsAt).format("MEDIUM_DATETIME")}</b>
              </td>
            </tr>
            <tr>
              <td style="padding:4px;color:#444444;">
                Stunden:
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
        Dein <i>${elmo.title}</i> Team
      </p>
    </td>
  </tr>
</table>
<@common.footer internal=true />
