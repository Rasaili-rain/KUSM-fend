
export default function NavBar({title} : { title: String }) {
  return (
    <>
      <nav className="big-white shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900"> { title } </h1>
        </div>
      </nav>
    </>
  );
}
