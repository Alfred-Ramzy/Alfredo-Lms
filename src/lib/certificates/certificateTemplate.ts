import type { Locale } from '@/types/firebase'

export function buildCertificateTemplate(input: { studentName: string; courseTitle: string; date: string; credentialId: string; locale: Locale; qrDataUrl: string }) {
  const isAr = input.locale === 'ar'
  return `
    <div style="width:1123px;height:794px;padding:48px;background:linear-gradient(135deg,#f8fbff,#eef4ff);font-family:${isAr ? 'Tajawal' : 'Inter'},sans-serif;color:#0f172a;position:relative;direction:${isAr ? 'rtl' : 'ltr'};">
      <div style="position:absolute;inset:24px;border:2px solid #7c3aed;border-radius:24px"></div>
      <div style="position:absolute;top:28px;${isAr ? 'left' : 'right'}:28px;opacity:.12;font-size:120px">🎓</div>
      <p style="font-size:20px;letter-spacing:.35em;text-transform:uppercase;color:#6d28d9">Alfredo LMS</p>
      <h1 style="font-size:52px;margin:24px 0 0;font-weight:900">${isAr ? 'شهادة إتمام' : 'Certificate of Completion'}</h1>
      <p style="font-size:22px;margin-top:16px;color:#475569">${isAr ? 'تُمنح هذه الشهادة إلى' : 'This certificate is proudly presented to'}</p>
      <h2 style="font-size:46px;margin:24px 0 0;font-weight:900;color:#0891b2">${input.studentName}</h2>
      <p style="font-size:24px;margin-top:28px;color:#334155">${isAr ? 'لاستكماله بنجاح دورة' : 'for successfully completing the course'}</p>
      <h3 style="font-size:34px;margin:18px 0 0;font-weight:800">${input.courseTitle}</h3>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:72px">
        <div>
          <p style="font-size:18px;color:#64748b">${isAr ? 'تاريخ الإتمام' : 'Completion Date'}</p>
          <p style="font-size:24px;font-weight:700">${input.date}</p>
          <p style="font-size:18px;color:#64748b;margin-top:16px">${isAr ? 'معرّف الاعتماد' : 'Credential ID'}</p>
          <p style="font-size:20px;font-weight:700">${input.credentialId}</p>
          <p style="font-size:18px;color:#64748b;margin-top:28px">${isAr ? 'أنشئت بواسطة ألفريد رمزي' : 'Created by Alfred Ramzy'}</p>
        </div>
        <div style="text-align:center">
          <img src="${input.qrDataUrl}" alt="QR code" style="width:120px;height:120px" />
          <p style="font-size:14px;color:#64748b;margin-top:10px">${isAr ? 'امسح للتحقق' : 'Scan to verify'}</p>
        </div>
      </div>
    </div>`
}
