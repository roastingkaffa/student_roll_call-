const members = [
  { id: 1, email: "zi24701533@gmail.com", name: "廖哲律", phone: "0917926187", type: "會員", join: "2025-04-28 23:56:57", login: "2025-04-28 23:56:57", ip: "220.132.139.237" },
  { id: 2, email: "anny96264@gmail.com", name: "楊瑀圓", phone: "0921620440", type: "會員", join: "2025-04-24 23:43:40", login: "2025-04-24 23:43:42", ip: "172.68.87.246" },
  { id: 3, email: "fangling23@yahoo.com.tw", name: "方進伶", phone: "0918482162", type: "會員", join: "2024-11-18 12:07:09", login: "2024-11-18 12:07:10", ip: "1.164.205.250" },
]

const MemberTable = () => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">會員列表</h2>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">新增會員</button>
      </div>
      <table className="min-w-full text-sm text-center border">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-2 px-3 border">會員帳號</th>
            <th className="py-2 px-3 border">類型</th>
            <th className="py-2 px-3 border">姓名</th>
            <th className="py-2 px-3 border">手機</th>
            <th className="py-2 px-3 border">加入時間</th>
            <th className="py-2 px-3 border">最後登入</th>
            <th className="py-2 px-3 border">最後登入 IP</th>
            <th className="py-2 px-3 border">功能</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{m.email}</td>
              <td className="border px-3 py-2">{m.type}</td>
              <td className="border px-3 py-2">{m.name}</td>
              <td className="border px-3 py-2">{m.phone}</td>
              <td className="border px-3 py-2">{m.join}</td>
              <td className="border px-3 py-2">{m.login}</td>
              <td className="border px-3 py-2">{m.ip}</td>
              <td className="border px-3 py-2 space-x-2">
                <button className="text-blue-500">✏️</button>
                <button className="text-red-500">❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MemberTable
