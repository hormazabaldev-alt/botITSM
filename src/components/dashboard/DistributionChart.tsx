type DistributionItem = {
  label: string;
  value: number;
};

export function DistributionChart({ title, items }: { title: string; items: DistributionItem[] }) {
  const max = Math.max(...items.map((item) => item.value));

  return (
    <article className="rounded-[8px] border border-[#d7e7f1] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#08233f]">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-[#35566f]">{item.label}</span>
              <span className="font-mono font-bold text-[#08233f]">{item.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#e9f3f8]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#08233f] to-[#00b8d9]"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
