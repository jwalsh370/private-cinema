'use client';


export function CategoryRow({ title, children }: { title: string; children: ReactNode }) {
  <section className="space-y-6">
    <h2 className="text-3xl font-bold text-white px-4">{title}</h2>
    <div className="grid grid-flow-col gap-8 overflow-x-auto pb-8 px-4 scrollbar-hide">
      {children}
    </div>
  </section>
}

