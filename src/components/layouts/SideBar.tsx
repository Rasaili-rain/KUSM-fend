import Block from "@assets/react.svg";

export default function Sidebar() {
  const blocks = ["Block-1", "Block-2", "Block-3"];
  return (
    <div className="w-64 h-screen text-black flex flex-col p-4 gap-3 border-r-2 border-gray-300">
      <div className="text-2xl font-bold p-2">KU Smart Meter</div>
      <div>
        <div className="w-full text-left px-3 py-2 rounded-lg transition">Dashboard</div>
        <div className="w-full text-left px-3 py-2 rounded-lg transition">Analysis</div>
        <div className="w-full text-left px-3 py-2 rounded-lg  transition">Map</div>
      </div>

      <div>
        <div className="py-2 px-1">Available Meters</div>
        <div>
          {blocks.length > 0 &&
            blocks.map((block) => (
              <div className="w-full text-left rounded-lg transition flex gap-3 px-3 py-2">
                {" "}
                <img src={Block} className="h-5 w-5" />
                {block}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
