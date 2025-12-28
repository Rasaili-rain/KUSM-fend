
export type OverviewInfoCardProps = {
  title: string;
  data: string;
};

export function OverviewInfoCard({ title, data }: OverviewInfoCardProps) {
  return (
  <div className="w-full h-full flex flex-col bg-[#EDEEFC] rounded-[20px]">
    <div className="px-6 pt-4 text-lg">
      {title}
    </div>
    <div className="flex-1" />
    <div className="px-6 pb-4 text-3xl font-semibold">
      {data}
    </div>
  </div>
  );
}

