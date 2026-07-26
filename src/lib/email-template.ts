// Shared branded shell for outbound emails — every founder/funder-facing
// email should render through this so a founder's inbox actually looks like
// Founda21, not a plain unstyled system notification. Inline styles only:
// email clients don't reliably support external/`<style>` CSS.
const NAVY = "#0A1F44";
const EMERALD = "#01884E";

function wordmarkHtml(): string {
  return `<span style="font-size:22px;font-weight:700;letter-spacing:-0.01em;">` +
    `<span style="color:${NAVY};">Fo</span>` +
    `<span style="color:${EMERALD};">u</span>` +
    `<span style="color:${NAVY};">nda</span>` +
    `<span style="color:${EMERALD};">21</span>` +
    `</span>`;
}

export function renderBrandedEmail(bodyHtml: string): string {
  return `
<div style="font-family: Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: ${NAVY};">
  <div style="margin-bottom: 28px;">${wordmarkHtml()}</div>
  <div style="font-size: 14px; line-height: 1.6;">
    ${bodyHtml}
  </div>
  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e2e8f0; color: ${NAVY}99; font-size: 12px;">
    Founda21 &middot; The Founder Readiness Standard
  </div>
</div>`;
}
