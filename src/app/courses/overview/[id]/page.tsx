"use client"
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <div className=" bg-background grid grid-cols-3 grid-rows-2   h-[800px]  w-[800px]  place-items-center gap-0 relative pt-64">
      <div className="double-border w-64 h-32">
      </div>
      <div className="double-border w-64 h-32">
      </div>
      <div className="double-border w-64 h-32">
      </div>
      <div className="double-border w-64 h-32">
      </div>
      <div className="double-border w-64 h-32">
      </div>
      <div className="double-border w-64 h-32">
      </div>
    </div>
  )
}

