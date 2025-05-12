import { useNavigate } from 'react-router-dom'

function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('teacher')
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="mt-8 text-sm text-red-400 hover:text-red-200 text-left"
    >
      🚪 登出
    </button>
  )
}

export default LogoutButton

