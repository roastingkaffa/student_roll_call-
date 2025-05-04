const Sidebar = () => {
  return (
    <div className="p-6">
      <div className="text-yellow-400 text-2xl font-bold mb-6">GOGOSHOP</div>
      <nav className="space-y-2 text-sm">
        <a href="#" className="block hover:bg-gray-700 px-4 py-2 rounded">會員管理</a>
        <a href="#" className="block hover:bg-gray-700 px-4 py-2 rounded">商品管理</a>
        <a href="#" className="block hover:bg-gray-700 px-4 py-2 rounded">報表分析</a>
      </nav>
    </div>
  )
}

export default Sidebar

