import { ShieldAlert } from 'lucide-react'

export function LockdownScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="max-w-2xl rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-6 text-6xl opacity-20">Alfredo LMS</div>
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-danger/20 text-danger">
          <ShieldAlert className="size-10" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Platform locked / المنصة متوقفة</h1>
        <p className="mt-3 text-slate-300">The license is not active or verification failed repeatedly. Please contact Alfred Ramzy. / حالة الترخيص غير نشطة أو فشل التحقق عدة مرات. يرجى التواصل مع ألفريد رمزي.</p>
        <p className="mt-6 text-sm text-slate-400">Contact: Alfred Ramzy</p>
      </div>
    </div>
  )
}
