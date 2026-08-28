type ReservationEmailInput = {
  guestName: string;
  propertyName: string;
  confirmationCode: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number | null;
  portalUrl: string;
};

function money(value: number | null) {
  if (value == null) return "Final total available in your reservation portal";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
}

function shell(title: string, body: string, portalUrl: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f0e8;font-family:Arial,sans-serif;color:#17221f"><div style="max-width:640px;margin:0 auto;padding:36px 18px"><div style="background:#173f39;color:#fff;padding:28px"><div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;opacity:.7">Pacific Stay Properties</div><h1 style="margin:14px 0 0;font-family:Georgia,serif;font-weight:400;font-size:34px">${title}</h1></div><div style="background:#fff;padding:30px;border:1px solid #e2ddd3">${body}<p style="margin:28px 0 0"><a href="${portalUrl}" style="display:inline-block;background:#173f39;color:#fff;text-decoration:none;padding:15px 20px">Open your reservation</a></p><p style="margin:24px 0 0;color:#6f7774;font-size:12px;line-height:1.7">Questions? Reply to this email or contact Pacific Stay at info@pacificstayproperties.com or 760-429-6633.</p></div></div></body></html>`;
}

export function approvedReservationEmail(input: ReservationEmailInput) {
  const body = `<p style="font-size:16px;line-height:1.7">Hi ${input.guestName},</p><p style="font-size:15px;line-height:1.7">Your requested dates for <strong>${input.propertyName}</strong> have been approved and are being held for you.</p><div style="margin:24px 0;padding:18px;background:#f7f4ee"><p style="margin:0 0 8px"><strong>Confirmation:</strong> ${input.confirmationCode}</p><p style="margin:0 0 8px"><strong>Dates:</strong> ${input.checkIn} to ${input.checkOut}</p><p style="margin:0 0 8px"><strong>Guests:</strong> ${input.guests}</p><p style="margin:0"><strong>Direct total:</strong> ${money(input.totalAmount)}</p></div><p style="font-size:15px;line-height:1.7">The next step is secure payment. Your private reservation page will show the payment button as soon as checkout is available.</p>`;
  return {
    subject: `Your ${input.propertyName} dates are approved`,
    html: shell("Your dates are approved.", body, input.portalUrl),
  };
}

export function confirmedReservationEmail(input: ReservationEmailInput) {
  const body = `<p style="font-size:16px;line-height:1.7">Hi ${input.guestName},</p><p style="font-size:15px;line-height:1.7">Payment is complete and your reservation at <strong>${input.propertyName}</strong> is confirmed.</p><div style="margin:24px 0;padding:18px;background:#f7f4ee"><p style="margin:0 0 8px"><strong>Confirmation:</strong> ${input.confirmationCode}</p><p style="margin:0 0 8px"><strong>Dates:</strong> ${input.checkIn} to ${input.checkOut}</p><p style="margin:0 0 8px"><strong>Guests:</strong> ${input.guests}</p><p style="margin:0"><strong>Total:</strong> ${money(input.totalAmount)}</p></div><p style="font-size:15px;line-height:1.7">Keep your reservation page handy for your stay details and Pacific Stay contact information.</p>`;
  return {
    subject: `${input.propertyName} reservation confirmed`,
    html: shell("You’re confirmed.", body, input.portalUrl),
  };
}
